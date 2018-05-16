var express = require('express');
var app = express();

var router = express.Router();
var mongoose = require('mongoose');
var User = require('./models/User');
var Message = require('./models/Message');
var config = require('./config');
var jwt = require('jsonwebtoken');
var bookRouter = require('./controllers/booksController');
var projectRouter = require('./controllers/projectsController');
var taskRouter = require('./controllers/tasksController');
var commentRouter = require('./controllers/commentsController');
var conversationsController = require('./controllers/conversationsController');
var authorRouter = require('./controllers/authorsController');
var bookCategoryRouter = require('./controllers/bookCategoriesController');
var todoRouter = require('./controllers/todosController');
var userRouter = require('./controllers/usersController');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cors = require('cors');

var tasksSocketID = {};

/* Socket IO START */
var server = require('http').createServer(express());
var io = require('socket.io')(server);
// task namespace
const task = io.of('/task');
io.on('connection', function (socket) {
    socket.on('subscribeToTimer', function (interval) {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(function () {
            socket.emit('timer', new Date());
        }, interval);
    });
    socket.on('sendNotificationToUserConversationWillStart', function (data) {
        io.in(data.receiver).emit('willGetMessageFromThisConversation', data);
    });
    socket.on('sendNotificationForAcceptFriendRequest', function (data) {
        io.in(data.receiver).emit('getNotificationForAcceptFriendRequest', data);
    });
    socket.on('join', function (data) {
        console.log('join: ', data);
        socket.join(data.room);
        // task.in(data.room).emit('message', "New user joined");
    });
    socket.on('joinAllProjectsAndSelfUser', function (data) {
        User.findById(data.userId, {
            password: 0,
            passwordConf: 0
        }).populate(['projects']).exec(function (err, user) {
            if(user){
                socket.join(data.userId);
                user.projects.map(function (project) {
                    if(project.conversation) socket.join(project.conversation);
                })
            }
        });
    });
    socket.on('new-message', function (data) {
        Message.create({conversation: data.room, sender: data.sender, body: data.message}, function (err, message) {
            if(message){
                Message.populate(message, {path: 'sender', select: 'username email photo', model: 'User'}, function(err, pMessage) {
                    io.in(data.room).emit('append-message', message);
                });
            }
        });
    });
    socket.on('new-comment', function (data) {
        io.in(data.task).emit('append-comment', data);
    });
});
const port = 8000;
io.listen(port);
/* Socket IO END */

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/projectManagement')
    .then(function () {
        console.log('connection successful');
    })
    .catch(function (err) {
        console.error(err);
    });

function checkUserSession(req, res, next) {
    var uploadedFile = req.url.indexOf('/uploads/');
    if (!(req.url === '/users'
            || req.url === '/registration/'
            || req.url === '/registration'
            || req.url === '/login'
            || req.url === '/login/'
            || req.url === '/logout'
            || req.url === '/logout/'
            || uploadedFile > -1
        )) {
        var token = req.headers['x-access-token'];
        console.log('access-token: ', token);
        if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) return res.status(401).send({auth: false, message: 'Failed to authenticate token.'});
            // res.status(200).send(decoded);
            User.findById(decoded.id, {password: 0, passwordConf: 0}, function (err, user) {
                if (err) return res.status(401).send("There was a problem finding the user.");
                if (!user) return res.status(401).send("No user found.");
            });
            req.headers.user_id = decoded.id;
            req.body.user_id = decoded.id;
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
app.use(express.static('public'));
app.use(checkUserSession);

app.use(userRouter);
app.use(projectRouter);
app.use(taskRouter);
app.use(commentRouter);
app.use(conversationsController);
app.use(bookRouter);
app.use(authorRouter);
app.use(bookCategoryRouter);
app.use(todoRouter);
app.use(router);

//  http://localhost:5000/
app.listen(config.port);
