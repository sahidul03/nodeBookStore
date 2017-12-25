var express = require('express');
var bookRouter = express.Router();
var Book = require('../models/Book.js');
var BookCategory = require('../models/BookCategory.js');
var Author = require('../models/Author.js');

/* GET ALL BOOKS */
bookRouter.get('/books/', function(req, res, next) {
    Book.find().populate(['author','category']).exec(function (err, books) {
        if (err) return next(err);
        return res.json(books);
    });
});

/* GET SINGLE BOOK BY ID */
bookRouter.get('/books/:id', function(req, res, next) {
    Book.findById(req.params.id).populate(['author','category']).exec(function (err, book) {
        if (err) return next(err);
        res.json(book);
    });
});

/* SAVE BOOK */
bookRouter.post('/books/', function(req, res, next) {
    Book.create(req.body, function (err, book) {
        if (err) return next(err);
        Author.findById(book.author, function (err, author) {
            if (err) return next(err);
            if(author.books){
                author.books.push(book._id);
            }
            else {
                author.books = [];
                author.books.push(book._id);
            }
            author.save();
        });
        BookCategory.findById(book.category, function (err, bookCategory) {
            if (err) return next(err);
            if(bookCategory.books){
                bookCategory.books.push(book._id);
            }
            else {
                bookCategory.books = [];
                bookCategory.books.push(book._id);
            }
            bookCategory.save();
        });
        res.json(book);
    });
});

/* UPDATE BOOK */
bookRouter.put('/books/:id', function(req, res, next) {
    Book.findByIdAndUpdate(req.params.id, req.body, function (err, book) {
        if (err) return next(err);
        res.json(book);
    });
});

/* DELETE BOOK */
bookRouter.delete('/books/:id', function(req, res, next) {
    Book.findByIdAndRemove(req.params.id, req.body, function (err, book) {
        if (err) return next(err);
        res.json(book);
    });
});

module.exports = bookRouter;