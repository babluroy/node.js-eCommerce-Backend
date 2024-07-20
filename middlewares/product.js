const Product = require('../models/product');

exports.isProductExist = (req, res, next) => {
    const productId = req.body?.productId;
    Product.findById(productId).then((product) => {
        if (!product) {
            return res.status(400).json({
                error: "Product doesn't exist"
            })
        }
        req.product = product;
        next();
    }).catch((err) => {
        return res.status(503).json({
            log: err,
            error: "Unknown Error"
        })
    })
}