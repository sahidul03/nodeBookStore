var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var bookRouter = require('./controllers/booksController');
var authorRouter = require('./controllers/authorsController');
var bookCategoryRouter = require('./controllers/bookCategoriesController');
var todoRouter = require('./controllers/todosController');
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


app.use(bookRouter);
app.use(authorRouter);
app.use(bookCategoryRouter);
app.use(todoRouter);
app.use(router);

// module.exports = router;


//  http://localhost:5000/
app.listen(5000);
