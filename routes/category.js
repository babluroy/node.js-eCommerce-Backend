const express = require('express');
const router =  express.Router();
const { check } = require('express-validator');
const { addCategory, getCategoryById, updateCategory, getCategories, deleteCategory } = require('../controllers/category');
const { isSignedIn, isAuthenticated, isAdmin } = require('../middlewares/auth');

router.param("categoryId", getCategoryById)

router.post('/add-category',
    [
        check("name", "name is required"),
        check("imageUrl", "Image is required"),
    ],
    isSignedIn, 
    isAdmin,
    addCategory
)

router.post('/update-category/:categoryId',
    isSignedIn, 
    isAdmin,
    getCategoryById,
    updateCategory
)

router.get('/get-categories',
    isSignedIn,
    getCategories
)

router.delete('/delete-category/:categoryId',
    isSignedIn,
    isAdmin,
    deleteCategory
)


module.exports = router;