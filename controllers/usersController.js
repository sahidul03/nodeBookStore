var express = require('express');
var userRouter = express.Router();
var User = require('../models/User.js');
var Conversation = require('../models/Conversation.js');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require('../config');
var async = require("async");


var multer = require('multer');
// var upload = multer({ dest: 'uploads/' });
const crypto = require('crypto');
const mime = require('mime-types');
var path = require("path");

// GET all users
userRouter.get('/users', function (req, res, next) {
    User.find({}, {email: 1, username: 1}, function (err, users) {
        return res.json(users);
    });
});

// GET a user by ID
userRouter.get('/users/:id', function (req, res, next) {
    User.findById(req.params.id, {
        password: 0,
        passwordConf: 0
    }).populate(['tasks', 'ownTasks', 'projects', 'ownProjects']).exec(function (err, user) {
        if (err) return next(err);
        return res.json(user);
    });
});

/* GET current_user */
userRouter.get('/current_user', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});

        User.findById(decoded.id, {
            password: 0,
            passwordConf: 0,
            tasks: 0,
            ownTasks: 0
        }).populate(['ownProjects', {
            path: 'projects',
            populate: {
                path: 'members',
                select: 'username email photo',
                model: 'User'
            },
            select: 'title shortName description updated_at members status conversation creator'
        }, {
            path: 'contacts',
            select: 'username email photo',
            model: 'User'
        }]).exec(function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            return res.json(user);
        });
    });

});

/* GET current_user_basic_info */
userRouter.get('/current_user_basic_info', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});

        User.findById(decoded.id, {
            password: 0,
            passwordConf: 0,
            gotFriendRequests: 0,
            sentFriendRequests: 0,
            contacts: 0,
            conversations: 0,
            ownProjects: 0,
            projects: 0,
            ownTasks: 0,
            tasks: 0
        }).exec(function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            return res.json(user);
        });
    });

});


//POST route for registration
userRouter.post('/registration', function (req, res, next) {

    async.waterfall([
        _password_mismatch(req),
        _usernameRequired,
        _emailRequired,
        _passwordRequired
    ], function (programError, errors) {
        if (programError) {
            console.log('Something is wrong!');
            console.log(programError);
        }
        console.log(errors);
        if (1) {
            var userData = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                passwordConf: req.body.passwordConf
            };

            User.create(userData, function (error, user) {
                if (error) {
                    if (error.code == 11000 && error.name == 'MongoError')
                        return res.json({flag: 0, message: 'Already exist with this email or username.'});
                } else {
                    // create a token
                    var token = jwt.sign({id: user._id}, config.secret, {
                        expiresIn: config.tokenExpiredTime // expires in an hour
                    });
                    return res.json({flag: 1, auth: true, token: token});
                }
            });

        } else {
            return res.json({flag: 0, message: 'All fields required.', errors: errors});
        }

    });

});

// password mismatch
function _password_mismatch(req) {
    return function (callback) {
        var body = req.body;
        var errors = {};
        if (req.body.password !== req.body.passwordConf) {
            errors.passwordConf = 'Passwords don\'t match.';
        }
        callback(null, errors, body);
    }
}

function _usernameRequired(errors, body, callback) {
    if (body.username == '') {
        errors.username = 'Username can\'t be blank.';
    }
    callback(null, errors, body);
}

function _emailRequired(errors, body, callback) {
    if (body.email == '') {
        errors.email = 'Email can\'t be blank.';
    }
    callback(null, errors, body);
}

function _passwordRequired(errors, body, callback) {
    if (body.password == '') {
        errors.password = 'Password can\'t be blank.';
    }
    callback(null, errors, body);
}

// POST route for Login
userRouter.post('/login', function (req, res, next) {
    
    if (req.body.username && req.body.password) {
        User.findOne({
                $or: [
                    {"username": req.body.username},
                    {"email": req.body.username}]
            }
        ).exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, response) {
                        if (response) {
                            // Passwords match
                            var token = jwt.sign({id: user._id}, config.secret, {
                                expiresIn: config.tokenExpiredTime
                            });
                            return res.json({flag: 1, auth: true, token: token});
                        } else {
                            // Passwords don't match
                            return res.json({flag: 0, message: 'Incorrect password.'});
                        }
                    });
                } else {
                    return res.json({flag: 0, message: 'Incorrect email or username.'});
                }
                // return res.redirect('/profile');
            }
        });

    } else {
        return res.json({flag: 0, message: 'All fields are required.'});
    }
});

// GET route after registering
userRouter.get('/profile', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});

        User.findById(decoded.id, {password: 0, passwordConf: 0}, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            return res.json(user);
        });
    });
});


// GET route for logging status
userRouter.get('/logging-status', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(200).send({flag: 0, auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(200).send({flag: 0, auth: false, message: 'Failed to authenticate token.'});
        return res.status(200).send({flag: 1, auth: true, message: 'Already logged In.'});
    });
});

// GET for logout logout
userRouter.post('/logout', function (req, res, next) {
    return res.json({flag: 1, auth: false, token: null});
});


/* Send friend request to project member */
userRouter.post('/send-friend-request', function (req, res, next) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;

    User.findById(sender, function (err, user) {
        if (user) {
            if (user.sentFriendRequests == undefined) {
                user.sentFriendRequests = [];
            }
            if (user.sentFriendRequests.indexOf(receiver) === -1) {
                user.sentFriendRequests.push(receiver);
            }
            user.save();
        }
    });

    User.findById(receiver, function (err, user) {
        if (user) {
            if (user.gotFriendRequests == undefined) {
                user.gotFriendRequests = [];
            }
            if (user.gotFriendRequests.indexOf(sender) === -1) {
                user.gotFriendRequests.push(sender);
            }
            user.save();
            return res.json({receiver: receiver});
        }
    });

});


/* Accept friend request of project member */
userRouter.post('/accept-friend-request', function (req, res, next) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;
    var conversation = Conversation.create({status: 1, users: [sender, receiver]}, function (err, conversation) {
        if (err) return next(err);
    });

    User.findById(receiver, function (err, user) {
        if (user) {
            var index = user.gotFriendRequests.indexOf(sender);
            if (index !== -1) {
                user.gotFriendRequests.splice(index, 1);
            }
            if (user.contacts == undefined) {
                user.contacts = [];
            }
            if (user.contacts.indexOf(sender) === -1) {
                user.contacts.push(sender);
            }

            if (user.conversations == undefined) {
                user.conversations = [];
            }
            if (user.conversations.indexOf(conversation._id) === -1) {
                user.conversations.push(conversation._id);
            }
            user.save();
        }
    });

    User.findById(sender, function (err, user) {
        if (user) {
            var index = user.sentFriendRequests.indexOf(receiver);
            if (index !== -1) {
                user.sentFriendRequests.splice(index, 1);
            }
            if (user.contacts == undefined) {
                user.contacts = [];
            }
            if (user.contacts.indexOf(receiver) === -1) {
                user.contacts.push(receiver);
            }

            if (user.conversations == undefined) {
                user.conversations = [];
            }
            if (user.conversations.indexOf(conversation._id) === -1) {
                user.conversations.push(conversation._id);
            }
            user.save();
            return res.json({
                _id: user._id,
                username: user.username,
                photo: user.photo,
                conversation: conversation._id
            });
        }
    });

});


/* Reject friend request of project member */
userRouter.post('/reject-friend-request', function (req, res, next) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;

    User.findById(receiver, function (err, user) {
        if (user) {
            var index = user.gotFriendRequests.indexOf(sender);
            if (index !== -1) {
                user.gotFriendRequests.splice(index, 1);
            }
            user.save();
        }
    });

    User.findById(sender, function (err, user) {
        if (user) {
            var index = user.sentFriendRequests.indexOf(receiver);
            if (index !== -1) {
                user.sentFriendRequests.splice(index, 1);
            }
            user.save();
            return res.json({sender: sender});
        }
    });

});


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/images/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
    }
});
var upload = multer({storage: storage});

/* Save profile image of user */
userRouter.post('/save-profile-image', upload.single('imageFile'), function (req, res, next) {
    User.findById(req.headers.user_id, function (err, user) {
        if (err) return res.json({photo: null, message: 'Not saved.'});
        if (user) {
            user.photo = '/uploads/images/' + req.file.filename;
            user.save();
            return res.json({photo: user.photo});
        }
    });
    // return res.json({photo: null, message: 'Not saved'});
});


module.exports = userRouter;