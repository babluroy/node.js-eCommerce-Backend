const express = require('express')
const router = express.Router();
const { check } = require('express-validator');
const { addProduct, updateProduct, getProductId, deleteProduct, getAllProducts, getProduct } = require('../controllers/ProductController');
const { isSignedIn, isAuthenticated, isAdmin } = require('../middlewares/auth');

router.param('productId', getProductId)

router.post('/add-product',
    [
        check("title", "Title must be under 200 characters").isLength({ max: 200 }),
        check("summary", "Summary must be under 80 characters").isLength({ max: 80 }),
        check("desc", "Description must be under 600 characters").isLength({ max: 600 }),
        check("images", "Image is required"),
        check("category", "Category is required"),
        check("sizes", "Sizes is required"),
    ],
    isSignedIn, isAdmin, addProduct
)

router.post('/update-product/:productId', isSignedIn, isAdmin, getProductId, updateProduct)

router.delete('/delete-product/:productId', isSignedIn, isAdmin, getProductId, deleteProduct)

router.get('/get-products', isSignedIn, getAllProducts)

router.get('/get-product/:productId', isSignedIn, getProductId, getProduct)

module.exports = router;