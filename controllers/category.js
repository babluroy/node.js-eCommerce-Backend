const { body, validationResult } = require('express-validator')
const formidable =  require("formidable");
const _ = require("lodash");
const { constants } = require('../constants');
const Category = require('../models/category');
const { deleteImagesFromS3 } = require('./common');

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description adds category
 */
exports.addCategory = (req, res) => {
    const {name, imageUrl} = req.body;

    const newCategory = new Category(req.body);

    Category.findOne({ name: name }).then((category) => {
        if(category){
            return res.status(400).json({
                error: 'Category already exists'
            })
        }
        newCategory.save().then((category) => {
            res.status(200).json({
                data: category,
                message: `Category created`
            });
        }).catch((error) => {
            res.status(400).json(error)
        })
    })
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description updates category
 */
exports.updateCategory = (req, res) => {
    const updatedData = req.body;
    const categoryId = req.params?.categoryId;

    Category.updateOne({_id: categoryId}, { $set: updatedData }).then((category) => {
        return res.status(200).json({  
            data: category,
            message: "Category updated"
        })
    }).catch((error) => {
        return res.status(520).json({
            log: error,
            error: "Unknown error"
        })
    })
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} id - product id
 * @description gets particular category id
 */
exports.getCategoryById = (req, res, next, id) => {
    if(!id){
        return res.status(502).json({
            error: "Product id is required"
        })
    }
    Category.findById(id).then((category) => {
        if(!category){
            return res.status(400).json({
                error: "Category doesn't exist"
            })
        }
        req.category = category;
        next();
    }).catch((error) => {
        return res.status(502).json({
            log: error,
            error: "Unknown error occoured"
        })
    })
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description retrives all the categories
 */
exports.getCategories = (req, res) => {
    Category.find().then((error, categories) => {
        if(error) {
            return res.status(502).json({
                log: error,
                error: "Unknown error"
            })
        }
        return res.status(200).json({
            data: categories,
            message: "Categories retrieved"
        })
    })
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description deletes cateory
 */
exports.deleteCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    Category.findByIdAndDelete({_id: categoryId}).then((category) => {
        const image = [ category.imageUrl ];
        deleteImagesFromS3(image, constants.S3_BUCKETS.CATEGORIES).then((res) => {}).catch((err) => {})
        return res.status(200).json({
            data: category,
            message: "Category has been deleted"
        })
    }).catch((error) => {
        return res.status(200).json({
            log: error,
            error: "Unknown error"
        })
    })
}
