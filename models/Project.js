var mongoose = require('mongoose');
var User = require('./User');

var ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {type: Number, default: 1},
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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

// Add project ID in associated user document
ProjectSchema.post('save', function (next) {
    var project = this;
    User.findById(project.creator, function (err, user) {
        if (err) return next(err);
        if(user.ownProjects){
            if(user.ownProjects.indexOf(project._id) === -1) {
                user.ownProjects.push(project._id);
            }
        }
        else {
            user.ownProjects = [];
            user.ownProjects.push(project._id);
        }
        user.save();
    });
});


module.exports = mongoose.model('Project', ProjectSchema);
