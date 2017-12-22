var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var Book = require('./models/Book.js');
var Todo = require('./models/Todo.js');
var Author = require('./models/Author.js');
var BookCategory = require('./models/BookCategory.js');
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/bookStore')
    .then(function () {
        console.log('connection successful');
    })
    .catch(function (err) {
        console.error(err);
    });


/* GET ALL BOOKS */
router.get('/books/', function(req, res, next) {
    Book.find().populate(['author','category']).exec(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE BOOK BY ID */
router.get('/books/:id', function(req, res, next) {
    Book.findById(req.params.id).populate(['author','category']).exec(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE BOOK */
router.post('/books/', function(req, res, next) {
    Book.create(req.body, function (err, post) {
        console.log('req.body: ');
        console.log(req.body);
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE BOOK */
router.put('/books/:id', function(req, res, next) {
    Book.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE BOOK */
router.delete('/books/:id', function(req, res, next) {
    Book.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET ALL TODOS */
router.get('/todos/', function(req, res, next) {
    Todo.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE TODO BY ID */
router.get('/todos/:id', function(req, res, next) {
    Todo.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE TODO */
router.post('/todos/', function(req, res, next) {
    Todo.create(req.body, function (err, post) {
        console.log('req.body: ');
        console.log(req.body);
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE TODO */
router.put('/todos/:id', function(req, res, next) {
    Todo.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE TODO */
router.delete('/todos/:id', function(req, res, next) {
    Todo.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


/* GET ALL book-categories */
router.get('/book-categories/', function(req, res, next) {
    BookCategory.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE book-categories BY ID */
router.get('/book-categories/:id', function(req, res, next) {
    BookCategory.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE book-categories */
router.post('/book-categories/', function(req, res, next) {
    BookCategory.create(req.body, function (err, post) {
        console.log('req.body: ');
        console.log(req.body);
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE book-categories */
router.put('/book-categories/:id', function(req, res, next) {
    BookCategory.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE book-categories */
router.delete('/book-categories/:id', function(req, res, next) {
    BookCategory.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});



/* GET ALL authors */
router.get('/authors/', function(req, res, next) {
    Author.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE authors BY ID */
router.get('/authors/:id', function(req, res, next) {
    Author.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE authors */
router.post('/authors/', function(req, res, next) {
    Author.create(req.body, function (err, post) {
        console.log('req.body: ');
        console.log(req.body);
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE authors */
router.put('/authors/:id', function(req, res, next) {
    Author.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE authors */
router.delete('/authors/:id', function(req, res, next) {
    Author.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

app.use(router);

// module.exports = router;


//  http://localhost:5000/
app.listen(5000);
