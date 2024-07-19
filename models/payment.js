const mongoose =  require('mongoose');
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema({
    paymentOrderId: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    isPaymentVerified: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true})

module.exports = mongoose.model("Payment", paymentSchema);