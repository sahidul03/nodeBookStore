var mongoose = require('mongoose');

var BookCategorySchema = new mongoose.Schema({
    title: String,
    description: String,
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    isActive: {type: Boolean, default: true},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('BookCategory', BookCategorySchema);
