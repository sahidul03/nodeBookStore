var mongoose = require('mongoose');

var AuthorSchema = new mongoose.Schema({
    name: String,
    address: String,
    abouts: String,
    phone: String,
    isActive: {type: Boolean, default: true},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Author', AuthorSchema);
