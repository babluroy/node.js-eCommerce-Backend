const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const _ = require("lodash");
const { constants } = require("../constants");
const Category = require("../models/category");
const { deleteImagesFromS3 } = require("./common");

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description adds category
 */
exports.store = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation errors", errors.array());
    }

    const { name, imageUrl } = req.body;

    const newCategory = new Category(req.body);

    try {
        const isCategoryExists = await Category.findOne({ name: name })

        if (isCategoryExists) {
            return apiResponse.errorResponseWithCode(res, 400, "Category already exists");
        }

        const category = await newCategory.save();
        if (category) {
            return apiResponse.successResponseWithData(res, "Category saved!", category)
        }
        return apiResponse.errorResponseWithCode(res, 400, "Something went wrong");
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.toString());
    }

};

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description updates category
 */
exports.updateCategory = (req, res) => {
    const updatedData = req.body;
    const categoryId = req.params?.categoryId;

    Category.updateOne({ _id: categoryId }, { $set: updatedData }).then((category) => {
        return res.status(200).json({
            data: category,
            message: "Category updated",
        })
    }).catch((error) => {
        return res.status(520).json({
            log: error,
            error: "Unknown error",
        })
    })
};

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} id - product id
 * @description gets particular category id
 */
exports.getCategoryById = (req, res, next, id) => {
    if (!id) {
        return res.status(502).json({
            error: "Product id is required",
        })
    }
    Category.findById(id).then((category) => {
        if (!category) {
            return res.status(400).json({
                error: "Category doesn't exist",
            })
        }
        req.category = category;
        next();
    }).catch((error) => {
        return res.status(502).json({
            log: error,
            error: "Unknown error occoured",
        })
    })
};

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description retrives all the categories
 */
exports.index = async (req, res) => {
    try {
        let categories = await Category.find();
        return apiResponse.successResponseWithData(res, "Categories found", categories);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.toString());
    }
};

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @description deletes cateory
 */
exports.deleteCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    Category.findByIdAndDelete({ _id: categoryId }).then((category) => {
        const image = [category.imageUrl];
        deleteImagesFromS3(image, constants.S3_BUCKETS.CATEGORIES).then((res) => { }).catch((err) => { });
        return res.status(200).json({
            data: category,
            message: "Category has been deleted",
        })
    }).catch((error) => {
        return res.status(200).json({
            log: error,
            error: "Unknown error",
        })
    })
};
