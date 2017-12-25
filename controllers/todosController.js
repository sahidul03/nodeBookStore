var express = require('express');
var todoRouter = express.Router();
var Todo = require('../models/Todo.js');

/* GET ALL TODOS */
todoRouter.get('/todos/', function(req, res, next) {
    Todo.find(function (err, todos) {
        if (err) return next(err);
        res.json(todos);
    });
});

/* GET SINGLE TODO BY ID */
todoRouter.get('/todos/:id', function(req, res, next) {
    Todo.findById(req.params.id, function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
});

/* SAVE TODO */
todoRouter.post('/todos/', function(req, res, next) {
    Todo.create(req.body, function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
});

/* UPDATE TODO */
todoRouter.put('/todos/:id', function(req, res, next) {
    Todo.findByIdAndUpdate(req.params.id, req.body, function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
});

/* DELETE TODO */
todoRouter.delete('/todos/:id', function(req, res, next) {
    Todo.findByIdAndRemove(req.params.id, req.body, function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
});

module.exports = todoRouter;