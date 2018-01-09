var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

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

// Add message ID in associated conversation document
MessageSchema.post('save', function (next) {
    var message = this;
    Conversation.findById(message.conversation, function (err, conversation) {
        if (err) return next(err);
        if(conversation.messages){
            if(conversation.messages.indexOf(message._id) === -1)
                conversation.messages.push(message._id);
        }
        else {
            conversation.messages = [];
            conversation.messages.push(message._id);
        }
        conversation.save();
    });
});


module.exports = mongoose.model('Message', MessageSchema);
