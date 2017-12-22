var mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
    isbn: String,
    title: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCategory'
    },
    published_date: Date,
    price: Number,
    discount: Number,
    isAvailable: {type: Boolean, default: true},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Book', BookSchema);
