var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var User = require('./models/User');
var config = require('./config');
var jwt = require('jsonwebtoken');
var bookRouter = require('./controllers/booksController');
var authorRouter = require('./controllers/authorsController');
var bookCategoryRouter = require('./controllers/bookCategoriesController');
var todoRouter = require('./controllers/todosController');
var userRouter = require('./controllers/usersController');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cors = require('cors');

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

function checkUserSession (req, res, next) {
    if(!(req.url === '/users'
            || req.url === '/registration/'
            || req.url === '/registration'
            || req.url === '/login'
            || req.url === '/login/'
            || req.url === '/logout'
            || req.url === '/logout/'
        )){
        var token = req.headers['x-access-token'];
        console.log('access-token: ', token);
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
            // res.status(200).send(decoded);
            next()
        });
    }
    else {
        next()
    }
    // keep executing the router middleware
    // next()
}

app.use(cors());
app.use(checkUserSession);

app.use(userRouter);
app.use(bookRouter);
app.use(authorRouter);
app.use(bookCategoryRouter);
app.use(todoRouter);
app.use(router);

//  http://localhost:5000/
app.listen(5000);
