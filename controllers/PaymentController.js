const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require('../models/payment');
const { getUserData } = require("../middlewares/user");
const { ProductCart, Order } = require("../models/order");
const { checkStock, subtractStock } = require("./ProductController");
const { clearCart } = require("./OrderController");
const { constants } = require("../constants");
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid");
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION_NAME });
const sqs = new AWS.SQS();
const QUEUE_URL = process.env.ORDER_PROCESSING;

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description creates order on razorpay
 */
exports.createOrder = async (req, res) => {
    const userData = getUserData(req.headers.authorization);

    if (!userData) {
        return res.status(500).json({
            error: "Error retriving user details"
        })
    }

    const cartProducts = await ProductCart.find({ user: userData.id });

    if (cartProducts.length === 0) {
        return res.status(404).json({
            error: "No products found in cart"
        });
    }

    const totalProductAmount = cartProducts.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = totalProductAmount;

    const productIds = cartProducts.map(item => item.product);
    const productQtys = cartProducts.map(item => item.quantity);

    const isStockAvailable = await checkStock(productIds, productQtys);

    if (!isStockAvailable) {
        return res.status(400).json({
            error: "Insufficient stock"
        });
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const amount = totalAmount;

        const paymentPayload = {
            amount: amount
        }

        const order = await razorpay.orders.create(paymentPayload);

        if (!order) {
            return res.status(500).json({
                error: "Error creating order on Razorpay"
            })
        }

        await this.updatePaymentDetails(userData, order)

        return res.status(200).json(order);

    } catch (err) {
        return res.status(500).send({
            log: err,
            error: "Error in processing details"
        });
    }
}

/**
 * @param {Object} userData - users data
 * @param {Object} paymentData - payment data
 * @description updates payment details
 */
exports.updatePaymentDetails = async (userData, paymentData) => {
    const allData = {
        user: userData.id,
        paymentOrderId: paymentData?.id
    };

    try {
        const payment = await Payment.findOneAndUpdate(
            { user: userData?.id },
            allData,
            { new: true, upsert: true, useFindAndModify: false }
        );

        if (!payment) {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description validate transaction
 */
exports.validatePayment = async (req, res) => {
    const userData = getUserData(req.headers.authorization);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
        return res.status(400).json({ msg: "Invalid transaction" });
    }

    try {
        const payment = await Payment.findOneAndUpdate(
            { user: userData?.id },
            { isPaymentVerified: true },
            { new: true, upsert: true, useFindAndModify: false }
        );
    } catch (err) { }

    const cartProducts = await ProductCart.find({ user: userData.id });
    const orderId = uuidv4();

    const preparedData = {
        orderId,
        products: cartProducts,
        paymentMode: constants.PAYMENT_TYPES.ONLINE,
        user: userData.id,
    };

    const orderData = new Order({ ...preparedData, status: "Pending" });
    await orderData.save();
    await clearCart(userData.id);

    // Send message to SQS
    await sqs.sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(preparedData),
    }).promise();

    return res.status(200).json({
        message: "Order is being processed",
        orderId,
    });
}


/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description validate transaction
 */
exports.testValiDatePayment = async (req, res) => {
    const userData = getUserData(req.headers.authorization);
    
    const cartProducts = await ProductCart.find({ user: userData.id });
    const orderId = uuidv4();

    const preparedData = {
        orderId,
        products: cartProducts,
        paymentMode: constants.PAYMENT_TYPES.ONLINE,
        user: userData.id,
    };

    const orderData = new Order({ ...preparedData, status: "Pending" });
    await orderData.save();
    await clearCart(userData.id);
    
    // Send message to SQS
    await sqs.sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(preparedData),
    }).promise();

    return res.status(200).json({
        message: "Order is being processed",
        orderId,
    });
    

}