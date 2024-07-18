const { body, validationResult } = require('express-validator')
const formidable =  require("formidable");
const _ = require("lodash");
const { constants } = require('../constants');
const Product = require('../models/product');
const { deleteImagesFromS3 } = require('./common');

exports.addProduct = (req, res) => {
    const {title, summary, desc, images, quantity, featured, category, sizes} = req.body;

    const product = new Product(req.body);

    product.save().then((product) => {
        return res.status(200).json({
            data: product,
            message: "Product has been added"
        })
    }).catch((err) => {
        return res.status(502).json({
            log: error,
            error: "Unknown error"
        })
    })

}

exports.updateProduct = (req, res) => {
    const updatedData = req.body;
    const productId = req.params?.productId;

    Product.updateOne({_id: productId}, {$set: updatedData}).then((product) => {
        return res.status(200).json({  
            data: product,
            message: "Product updated"
        })
    }).catch((error) => {
        return res.status(520).json({
            log: error,
            error: "Unknown error"
        })
    })
}

exports.deleteProduct = (req, res) => {
    const productId = req.params?.productId;
    Product.findByIdAndDelete({_id: productId}).then((product) => {
        deleteImagesFromS3(product?.images, constants.S3_BUCKETS.PRODUCTS).then((res) => {}).catch((err) => {})
        return res.status(200).json({  
            data: product,
            message: "Product Deleted"
        })
    }).catch((error) => {
        return res.status(520).json({
            log: error,
            error: "Unknown error"
        })
    })

}

exports.getProductId = (req, res, next, id) => {
    Product.findById(id).then((product) => {
        if(!product){
            return res.status(400).json({
                error: "Product doesn't exist"
            })
        }
        req.product = product;
        next();
    })
}

exports.getAllProducts = async (req, res) => {
    let { pageNumber, limit, sortBy, size, category, minPrice, maxPrice, featured } = req.query;

    if (!pageNumber) pageNumber = 1;
    if (!limit || limit > 100) limit = 9;

    const limit_query = parseInt(limit);
    const skip = (pageNumber - 1) * limit;
    sortBy = sortBy ? sortBy : "_id";

    // Building the query object
    let query = {};

    if (size) {
        query["sizes.name"] = size;
    }

    if (category) {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query["sizes.price"] = {};
        if (minPrice) {
            query["sizes.price"].$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            query["sizes.price"].$lte = parseFloat(maxPrice);
        }
    }

    if (featured !== undefined) {
        query.featured = featured === 'true';
    }

    try {
        const products = await Product.find(query)
            .sort([[sortBy, "desc"]])
            .skip(skip)
            .limit(limit_query)
            .exec();

        res.status(200).json(products);
    } catch (err) {
        res.status(400).json({
            error: "Products not found"
        });
    }
};

exports.getProduct = (req, res) => {
    const productId = req.params?.productId;
    Product.findById(productId).then((product) => {
        if(!product){
            return res.status(400).json({
                error: "Product doesn't exist"
            })
        }
        return res.status(200).json({  
            data: product,
            message: "Product Retrived"
        })
    })
}

exports.checkStock = (cartProducts, productQuantities) => {
    return new Promise((resolve, reject) => {
        Product.find({ _id: { $in: cartProducts } }).then((data) => {
            for (let i = 0; i < data.length; i++) {
                const product = data[i];
                const requiredQuantity = productQuantities[i];
                if (product.quantity < requiredQuantity) {
                    return reject(false);
                }
            }
            resolve(true);
        }).catch((err) => {
            reject(false);
        });
    });
}


exports.subtractStock = async (productIds, quantities) => {
    try {
        if (productIds.length !== quantities.length) {
            return false
        }
        const updateOperations = productIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $inc: { quantity: -quantities[index] } },
                upsert: false,
            }
        }));
        const result = await Product.bulkWrite(updateOperations);
        return result;
    } catch (err) {
       return false;
    }
};