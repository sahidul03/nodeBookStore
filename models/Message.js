var mongoose = require('mongoose');
var User = require('./User');
var Task = require('./Task');

var MessageSchema = new mongoose.Schema({
    body: String,
    status: {type: Number, default: 1},
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updated_at: {type: Date, default: Date.now}
});

// // Add comment ID in associated user document
// MessageSchema.post('save', function (next) {
//     var comment = this;
//     User.findById(comment.commenter, function (err, user) {
//         if (err) return next(err);
//         if(user.comments){
//             if(user.comments.indexOf(comment._id) === -1)
//                 user.comments.push(comment._id);
//         }
//         else {
//             user.comments = [];
//             user.comments.push(comment._id);
//         }
//         user.save();
//     });
//     Task.findById(comment.task, function (err, task) {
//         if (err) return next(err);
//         if(task.comments){
//             if(task.comments.indexOf(comment._id) === -1)
//                 task.comments.push(comment._id);
//         }
//         else {
//             task.comments = [];
//             task.comments.push(comment._id);
//         }
//         task.save();
//     });
// });


module.exports = mongoose.model('Message', MessageSchema);
