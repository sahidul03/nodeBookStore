var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var Book = require('./models/Book.js');
var Todo = require('./models/Todo.js');
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/mean-app')
    .then(function () {
        console.log('connection successful');
    })
    .catch(function (err) {
        console.error(err);
    });


/* GET ALL BOOKS */
router.get('/books/', function(req, res, next) {
    Book.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
    });
});

/* GET SINGLE BOOK BY ID */
router.get('/books/:id', function(req, res, next) {
    Book.findById(req.params.id, function (err, post) {
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

app.use(router);

// module.exports = router;


//  http://localhost:5000/
app.listen(5000);
