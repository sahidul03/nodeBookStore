var express = require('express');
var commentRouter = express.Router();
var Comment = require('../models/Comment.js');
/* GET ALL comments */
commentRouter.get('/comments', function(req, res, next) {
    Comment.find().populate(['task', 'commenter']).exec(function (err, comments) {
        if (err) return next(err);
        return res.json(comments);
    });
});

/* GET SINGLE comment BY ID */
commentRouter.get('/comments/:id', function(req, res, next) {
    Comment.findById(req.params.id).populate(['task', 'commenter']).exec(function (err, comment) {
        if (err) return next(err);
        res.json(comment);
    });
});

/* SAVE comment */
commentRouter.post('/comments', function(req, res, next) {
    req.body.commenter = req.headers.user_id;
    Comment.create(req.body, function (err, comment) {
        if (err) return next(err);
        res.json(comment);
    });
});

/* UPDATE comment */
commentRouter.put('/comments/:id', function(req, res, next) {
    Comment.findByIdAndUpdate(req.params.id, req.body, function (err, comment) {
        if (err) return next(err);
        res.json(comment);
    });
});

/* DELETE comment */
commentRouter.delete('/comments/:id', function(req, res, next) {
    Comment.findByIdAndRemove(req.params.id, req.body, function (err, comment) {
        if (err) return next(err);
        res.json(comment);
    });
});

module.exports = commentRouter;