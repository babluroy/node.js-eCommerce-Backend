const { ProductCart, Order } = require("../models/order");

exports.isProductExistOnCart = (req, res, next) => {
    const cartProductId = req.params?.cartProductId;
    ProductCart.findById(cartProductId).then((product) => {
        if (!product) {
            return res.status(400).json({
                error: "Product doesn't exist on cart"
            })
        } 
        next();
    }).catch((err) => {
        return res.status(503).json({
            log: err,
            error: "Unknown Error"
        })
    })
}

exports.getOrderId = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId).then((order) => {
        if(!order) {
            return res.status(400).json({
                error: "Order doesn't exist"
            })
        }
        next();
    }).catch((err) => {
        return res.status(503).json({
            log: err,
            error: "Unknown Error"
        })
    })
} 