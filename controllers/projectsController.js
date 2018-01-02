var express = require('express');
var projectRouter = express.Router();
var Project = require('../models/Project.js');

/* GET ALL projects */
projectRouter.get('/projects', function(req, res, next) {
    Project.find().populate(['tasks','members', 'comments', 'creator']).exec(function (err, projects) {
        if (err) return next(err);
        return res.json(projects);
    });
});

/* GET only id and title of project BY ID */
projectRouter.get('/projects/:id', function(req, res, next) {
    Project.findById(req.params.id).populate(['tasks','members', 'comments', 'creator']).exec(function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* GET SINGLE project BY ID */
projectRouter.get('/min-projects/:id', function(req, res, next) {
    Project.findById(req.params.id, {title: 1}).exec(function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* SAVE project */
projectRouter.post('/projects', function(req, res, next) {
    req.body.creator = req.headers.user_id;
    req.body.members = [req.headers.user_id];
    Project.create(req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* UPDATE project */
projectRouter.put('/projects/:id', function(req, res, next) {
    Project.findByIdAndUpdate(req.params.id, req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* DELETE project */
projectRouter.delete('/projects/:id', function(req, res, next) {
    Project.findByIdAndRemove(req.params.id, req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

module.exports = projectRouter;