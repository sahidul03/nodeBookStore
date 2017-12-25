var express = require('express');
var bookCategoryRouter = express.Router();
var BookCategory = require('../models/BookCategory.js');

/* GET ALL book-categories */
bookCategoryRouter.get('/book-categories/', function(req, res, next) {
    BookCategory.find().populate('books').exec(function (err, bookCategories) {
        if (err) return next(err);
        res.json(bookCategories);
    });
});

/* GET SINGLE book-categories BY ID */
bookCategoryRouter.get('/book-categories/:id', function(req, res, next) {
    BookCategory.findById(req.params.id).populate('books').exec(function (err, bookCategory) {
        if (err) return next(err);
        res.json(bookCategory);
    });
});

/* SAVE book-categories */
bookCategoryRouter.post('/book-categories/', function(req, res, next) {
    BookCategory.create(req.body, function (err, bookCategory) {
        if (err) return next(err);
        res.json(bookCategory);
    });
});

/* UPDATE book-categories */
bookCategoryRouter.put('/book-categories/:id', function(req, res, next) {
    BookCategory.findByIdAndUpdate(req.params.id, req.body, function (err, bookCategory) {
        if (err) return next(err);
        res.json(bookCategory);
    });
});

/* DELETE book-categories */
bookCategoryRouter.delete('/book-categories/:id', function(req, res, next) {
    BookCategory.findByIdAndRemove(req.params.id, req.body, function (err, bookCategory) {
        if (err) return next(err);
        res.json(bookCategory);
    });
});

module.exports = bookCategoryRouter;