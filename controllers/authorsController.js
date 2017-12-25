var express = require('express');
var authorRouter = express.Router();
var Author = require('../models/Author.js');

/* GET ALL authors */
authorRouter.get('/authors/', function(req, res, next) {
    Author.find().populate('books').exec(function (err, authors) {
        if (err) return next(err);
        res.json(authors);
    });
});

/* GET SINGLE authors BY ID */
authorRouter.get('/authors/:id', function(req, res, next) {
    Author.findById(req.params.id).populate('books').exec(function (err, author) {
        if (err) return next(err);
        res.json(author);
    });
});

/* SAVE authors */
authorRouter.post('/authors/', function(req, res, next) {
    Author.create(req.body, function (err, author) {
        if (err) return next(err);
        res.json(author);
    });
});

/* UPDATE authors */
authorRouter.put('/authors/:id', function(req, res, next) {
    Author.findByIdAndUpdate(req.params.id, req.body, function (err, author) {
        if (err) return next(err);
        res.json(author);
    });
});

/* DELETE authors */
authorRouter.delete('/authors/:id', function(req, res, next) {
    Author.findByIdAndRemove(req.params.id, req.body, function (err, author) {
        if (err) return next(err);
        res.json(author);
    });
});

module.exports = authorRouter;