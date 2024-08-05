const { check, body } = require("express-validator");

const CreateCategoryRequestValidation = () => {
    return [
        body('name').notEmpty().withMessage("Category name required").isLength({ max: 15 }).withMessage("Name length cannot be greater than 15 characters.")
    ]
}
module.exports = { CreateCategoryRequestValidation }