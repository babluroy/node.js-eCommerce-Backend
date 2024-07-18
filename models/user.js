const mongoose  = require('mongoose');
const {constants} = require("../constants/index")

const addressSchema = new mongoose.Schema({
    houseNumber: String,
    lane: String,
    city: String,
    locality: String,
    address: String,
    state: String,
    pin: String,
})

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        maxlength: 32,
        trim: true,
        required: false,
    },
    lastname: {
        type: String,
        maxlength: 32,
        trim: true,
        required: false,
    },
    address: addressSchema,
    userType: {
        type: Number,
        role: constants.USER_TYPES.USER
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    salt: String
},{ timestamps: true })

module.exports = mongoose.model("User", userSchema)