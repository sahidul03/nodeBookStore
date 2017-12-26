var express = require('express');
var userRouter = express.Router();
var User = require('../models/User.js');
var bcrypt = require('bcrypt');


// GET route for reading data
userRouter.get('/users/', function (req, res, next) {
    return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for registration
userRouter.post('/users/', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        // var err = new Error('Passwords do not match.');
        // err.status = 400;
        // res.send("passwords dont match");
        // return next(err);
        var message = {
            flag: 0,
            message: "Passwords don't match."
        };
        return res.json(message)
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        };

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                var responseMessage = {
                    user: user,
                    message: 'Successfully registered.',
                    flag: 1
                };
                return res.json(responseMessage);
            }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                // var err = new Error('Wrong email or password.');
                // err.status = 401;
                // return next(err);
                var message = {
                    flag: 0,
                    message: "Wrong email or password."
                };
                return res.json(message)
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        // var err = new Error('All fields required.');
        // err.status = 400;
        // return next(err);
        var message = {
            flag: 0,
            message: "All fields required."
        };
        return res.json(message)
    }
});

// POST route for Login
userRouter.post('/login/', function (req, res, next) {

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
                if(user){
                    bcrypt.compare(req.body.password, user.password, function(err, response) {
                        if(response) {
                            // Passwords match
                            req.session.userId = user._id;
                            var message = {
                                flag: 1,
                                message: 'Successfully logged In.'
                            };
                            return res.json(message)
                        } else {
                            // Passwords don't match
                            var message = {
                                flag: 0,
                                message: 'Incorrect password.'
                            };
                            return res.json(message)
                        }
                    });
                }else {
                    var message = {
                        flag: 0,
                        message: 'Incorrect email or username.'
                    };
                    return res.json(message)
                }
                // return res.redirect('/profile');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET route after registering
userRouter.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    res.status(401);
                    res.send('Not authorized! Go back!');
                } else {
                    return res.json(user)
                }
            }
        });
});

// GET for logout logout
userRouter.post('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                var responseMessage = {
                    message: 'Logged out.',
                    flag: 1
                };
                return res.json(responseMessage);
            }
        });
    }
});

module.exports = userRouter;