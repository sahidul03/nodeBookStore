var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var User = require('./models/User');
var bookRouter = require('./controllers/booksController');
var authorRouter = require('./controllers/authorsController');
var bookCategoryRouter = require('./controllers/bookCategoriesController');
var todoRouter = require('./controllers/todosController');
var userRouter = require('./controllers/usersController');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

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


//use sessions for tracking logins
//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
}));

function checkUserSession (req, res, next) {
    if(!(req.url === '/users'
            || req.url === '/users/'
            || req.url === '/login'
            || req.url === '/login/'
            || req.url === '/logout'
            || req.url === '/logout/'
        )){
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        // var err = new Error('Not authorized! Go back!');
                        // err.status = 401;
                        // return next(err);
                        res.status(401);
                        res.send('Not authorized! Go back!');
                    }else {
                        next()
                    }
                }
            });
    }
    else {
        next()
    }

    // keep executing the router middleware
    // next()

}
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use(checkUserSession);

app.use(userRouter);
app.use(bookRouter);
app.use(authorRouter);
app.use(bookCategoryRouter);
app.use(todoRouter);
app.use(router);

// module.exports = router;


//  http://localhost:5000/
app.listen(5000);
