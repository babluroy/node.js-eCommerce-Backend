const express = require('express');
const router =  express.Router();
const { check } = require('express-validator');
const { isSignedIn, isAuthenticated, isAdmin, isBasicUserDetailExists } = require('../middlewares/auth');
const { addToCart, removeFromCart, order, getAllOrders, getCartProducts } = require('../controllers/order');
const { isProductExist } = require('../middlewares/product');
const { isProductExistOnCart } = require('../middlewares/order');

router.param("cartProductId", isProductExistOnCart)

router.post('/add-to-cart',
    isSignedIn,
    isProductExist,
    addToCart
)

router.delete('/remove-from-cart/:cartProductId',
    isSignedIn,
    isProductExistOnCart,
    removeFromCart
)

router.post('/order', 
    isSignedIn,
    isBasicUserDetailExists,
    order
)

router.get('/get-orders', 
    isSignedIn,
    getAllOrders
)

router.get('/get-cart', 
    isSignedIn,
    getCartProducts
)

module.exports = router;