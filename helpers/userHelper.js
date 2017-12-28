var config = require('../config');
var jwt = require('jsonwebtoken');
var User = require('../models/User');

var currentUser = function(token) {
    jwt.verify(token, config.secret, function(err, decoded) {
        // res.status(200).send(decoded);
        User.findById(decoded.id, {password: 0, passwordConf: 0}, function (err, user) {
            if(err) return null;
            return user;
        });
    });
};

module.exports = currentUser;