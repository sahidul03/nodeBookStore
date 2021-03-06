var express = require('express');
var taskRouter = express.Router();
var Task = require('../models/Task.js');
var User = require('../models/User.js');
/* GET ALL tasks */
taskRouter.get('/tasks', function (req, res, next) {
    Task.find().populate(['parentTask', 'subTasks', 'assignee', 'project', 'comments', 'creator']).exec(function (err, tasks) {
        if (err) return next(err);
        return res.json(tasks);
    });
});

/* GET SINGLE task BY ID */
taskRouter.get('/tasks/:id', function (req, res, next) {
    Task.findById(req.params.id).populate([
    {
        path: 'parentTask',
        select: 'taskNumber title description updated_at'
    }, 
    {
        path: 'subTasks',
        populate: [{
            path: 'creator',
            select: 'username email photo',
            model: 'User'
        },
        {
            path: 'assignee',
            select: 'username email photo',
            model: 'User'
        }],
        select: 'creator assignee taskNumber title description updated_at'
    }, 
    {
        path: 'assignee',
        select: 'username email photo'
    },
    {
        path: 'project',
        populate: [{
            path: 'members',
            select: 'username email photo',
            model: 'User'
        }],
        select: 'title shortName members'
    },
    {
        path: 'comments',
        populate: {
            path: 'commenter',
            select: 'username email photo',
            model: 'User'
        }
    },
    {
        path: 'creator',
        select: 'username email photo'
    }]).exec(function (err, task) {
        if (err) return res.status(404).send({message: 'Page not found.'});
        res.json(task);
    });
});

/* GET only id and title task BY ID */
taskRouter.get('/min-tasks/:id', function (req, res, next) {
    Task.findById(req.params.id, {title: 1, taskNumber: 1}).exec(function (err, task) {
        if (err) return res.json(null);
        res.json(task);
    });
});


/* SAVE task */
taskRouter.post('/tasks', function (req, res, next) {
    req.body.creator = req.headers.user_id;
    Task.create(req.body, function (err, task) {
        if (err) return next(err);
        if(task.parentTask){
            Task.findById(task.parentTask, function (err, parent_task) {
                if (err) return next(err);
                console.log('parent_task', parent_task);
                if(parent_task.subTasks){
                    if(parent_task.subTasks.indexOf(task._id) === -1)
                        parent_task.subTasks.push(task._id);
                }
                else {
                    parent_task.subTasks = [];
                    parent_task.subTasks.push(task._id);
                }
                parent_task.save();
            });
        }
        res.json(task);
    });
});

/* UPDATE task */
taskRouter.put('/tasks/:id', function (req, res, next) {
    Task.findByIdAndUpdate(req.params.id, req.body, function (err, task) {
        if (err) return next(err);
        res.json(task);
    });
});

/* DELETE task */
taskRouter.delete('/tasks/:id', function (req, res, next) {
    Task.findByIdAndRemove(req.params.id, req.body, function (err, task) {
        if (err) return next(err);
        res.json(task);
    });
});


/* Add assignee to task */
taskRouter.post('/add-assignee', function(req, res, next) {
    var assignee_id = req.body.assignee_id;
    var task_id = req.body.task_id;
    Task.findById(task_id, function (err, task) {
        if (task) {
            task.assignee = assignee_id;
            task.save();
        }
    });
    User.findById(assignee_id, function (err, user) {
        if (user) {
            if (user.tasks) {
                if (user.tasks.indexOf(task_id) === -1) {
                    user.tasks.push(task_id);
                }
            }
            else {
                user.tasks = [];
                user.tasks.push(task_id);
            }
            user.save();
            return res.json(user);
        }
    });

});

/* Change the status of task */
taskRouter.post('/tasks/change-status', function(req, res, next) {
    var status = req.body.status;
    var task_id = req.body.task_id;
    Task.findById(task_id, function (err, task) {
        if (task) {
            task.status = status;
            task.save();
            return res.json({status: task.status});
        }
        if(err){
            return res.status(500).send("There was a problem of changing the task status.");
        }
    });
});

module.exports = taskRouter;