require("dotenv").config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION_NAME });
const { Order } = require("../models/order");
const { checkStock, subtractStock } = require("../controllers/ProductController");
const { clearCart } = require("../controllers/OrderController");
const sqs = new AWS.SQS();
const QUEUE_URL = process.env.ORDER_PROCESSING;

/**
 * @name processOrder
 * @description 
 * process the order
 */
const processOrder = async (message) => {
    const { orderId, user, products } = JSON.parse(message.Body);
    const productIds = products.map(p => p.product);
    const productQtys = products.map(p => p.quantity);

    // Check stock availability
    const isStockAvailable = await checkStock(productIds, productQtys);

    if (!isStockAvailable) {
        await Order.findOneAndUpdate({ orderId }, { status: "Failed" });
        console.log(`Order ${orderId} failed due to insufficient stock.`);
        return;
    }

    // Subtract stock and confirm order
    await clearCart(user);
    await subtractStock(productIds, productQtys);
    await Order.findOneAndUpdate({ orderId }, { status: "Processing" });

    console.log(`Order ${orderId} successfully processed.`);
}

/**
 * @name pollOrderQueue
 * @description 
 * polls messages from order-processing queue for processing orders
 */
exports.pollOrderQueue = async() => {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10,
    }
    
    while (true) {
        try {
            const data = await sqs.receiveMessage(params).promise();
            if(data.Messages){
                for (let message of data.Messages){
                    await processOrder(message);
                    await sqs.deleteMessage({
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle,
                    }).promise();
                }
            }
        } catch (error) {
            console.log("Error polling SQS:", error)
        }
    }
}
