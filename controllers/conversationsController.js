var express = require('express');
var conversationRouter = express.Router();
var Conversation = require('../models/Conversation.js');
var User = require('../models/User.js');
/* GET ALL conversations */
conversationRouter.get('/conversations', function (req, res, next) {
    Conversation.find().populate([{
        path: 'messages',
        populate: {
            path: 'sender',
            select: 'username email',
            model: 'User'
        }
    }]).exec(function (err, conversations) {
        if (err) return next(err);
        return res.json(conversations);
    });
});

/* GET SINGLE conversation BY ID */
conversationRouter.get('/conversations/:id', function (req, res, next) {
    Conversation.findById(req.params.id).populate([{
        path: 'messages',
        populate: {
            path: 'sender',
            select: 'username email',
            model: 'User'
        }
    }]).exec(function (err, conversation) {
        console.log('conversation',conversation);
        if (err) return next(err);
        res.json(conversation);
    });
});

/* GET only id and title conversation BY ID */
conversationRouter.get('/min-conversations/:id', function (req, res, next) {
    Conversation.findById(req.params.id, {title: 1}).exec(function (err, conversation) {
        if (err) return res.json(null);
        res.json(conversation);
    });
});


/* SAVE conversation */
conversationRouter.post('/conversations', function (req, res, next) {
    req.body.creator = req.headers.user_id;
    Conversation.create(req.body, function (err, conversation) {
        if (err) return next(err);
        if(conversation.parentconversation){
            conversation.findById(conversation.parentconversation, function (err, parent_conversation) {
                if (err) return next(err);
                console.log('parent_conversation', parent_conversation);
                if(parent_conversation.subconversations){
                    if(parent_conversation.subconversations.indexOf(conversation._id) === -1)
                        parent_conversation.subconversations.push(conversation._id);
                }
                else {
                    parent_conversation.subconversations = [];
                    parent_conversation.subconversations.push(conversation._id);
                }
                parent_conversation.save();
            });
        }
        res.json(conversation);
    });
});

/* UPDATE conversation */
conversationRouter.put('/conversations/:id', function (req, res, next) {
    Conversation.findByIdAndUpdate(req.params.id, req.body, function (err, conversation) {
        if (err) return next(err);
        res.json(conversation);
    });
});

/* DELETE conversation */
conversationRouter.delete('/conversations/:id', function (req, res, next) {
    Conversation.findByIdAndRemove(req.params.id, req.body, function (err, conversation) {
        if (err) return next(err);
        res.json(conversation);
    });
});

module.exports = conversationRouter;