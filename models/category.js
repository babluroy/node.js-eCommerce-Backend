const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 15,
        unique: true
    },
    imageUrl: {
        type: String
    }
}, { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema);