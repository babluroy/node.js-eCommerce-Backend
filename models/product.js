const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const product = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 200,
        required: true,
    },
    summary: {
        type: String,
        maxlength: 80,
        required: true,
    },
    desc: {
        type: String,
        maxlength: 600,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    quantity: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false,
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true
    },
    sizes: [{
        name: {
            type: String,
            maxlength: 10,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
    }],
}, {timestamps: true} );

module.exports = mongoose.model("Product", product);