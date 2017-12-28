var mongoose = require('mongoose');
var User = require('./User');

var TaskSchema = new mongoose.Schema({
    title: String,
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
});


module.exports = mongoose.model('Task', TaskSchema);
