var mongoose = require('mongoose');
var User = require('./User');
var Project = require('./Project');

var TaskSchema = new mongoose.Schema({
    title: String,
    taskNumber: String,
    description: String,
    status: {type: Number, default: 1},
    duration: {type: Number, default: 0},
    spent_time: {type: Number, default: 0},
    start_date: Date,
    end_date: Date,
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    subTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    updated_at: {type: Date, default: Date.now}
});

//Task number generate and add to new task
TaskSchema.pre('save', function (next) {
    var task = this;
    Project.findById(task.project).populate(['tasks']).exec(function (err, project) {
        if (err) return next(err);
        var projectShortName = project.shortName.toUpperCase();
        if(project.tasks && project.tasks.length > 0){
            var last_task = project.tasks[project.tasks.length - 1]
            var last_task_number = last_task.taskNumber;
            console.log(last_task);
            var onlyNumberPart = last_task_number.replace(projectShortName +'-', "");
            onlyNumberPart = parseInt(onlyNumberPart);
            onlyNumberPart = onlyNumberPart + 1;
            currentTaskNumber = projectShortName +'-' + onlyNumberPart.toString();
            
        }
        else {
            currentTaskNumber = projectShortName +'-' + '111';           
        }
        task.taskNumber = currentTaskNumber
        next();
    });
});

// Add task ID in associated user document
TaskSchema.post('save', function (next) {
    var task = this;
    User.findById(this.creator, function (err, user) {
        if (err) return next(err);
        if(user.ownTasks){
            if(user.ownTasks.indexOf(task._id) === -1)
                user.ownTasks.push(task._id);
        }
        else {
            user.ownTasks = [];
            user.ownTasks.push(task._id);
        }
        user.save();
    });
    Project.findById(task.project, function (err, project) {
        if (err) return next(err);
        if(project.tasks){
            if(project.tasks.indexOf(task._id) === -1)
                project.tasks.push(task._id);
        }
        else {
            project.tasks = [];
            project.tasks.push(task._id);
        }
        project.save();
    });
});


module.exports = mongoose.model('Task', TaskSchema);
