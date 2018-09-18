var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

var ProjectSchema = new mongoose.Schema({
    title: String,
    shortName: String,
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
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    updated_at: {type: Date, default: Date.now}
});

// //hashing a password before saving it to the database
// ProjectSchema.pre('save', function (next) {
//     var project = this;
//     if(project.conversation === undefined || project.conversation === '') {
//         Conversation.create({status: 1}, function (err, conversation) {
//             if (err) return next(err);
//             if(conversation){
//                 project.conversation = conversation._id
//             }
//             next();
//         });
//     }else {
//         next();
//     }
// });

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
        if(user.projects){
            if(user.projects.indexOf(project._id) === -1) {
                user.projects.push(project._id);
            }
        }
        else {
            user.projects = [];
            user.projects.push(project._id);
        }
        user.save();
    });
});


module.exports = mongoose.model('Project', ProjectSchema);
