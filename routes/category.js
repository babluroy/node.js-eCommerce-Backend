const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { store, getCategoryById, updateCategory, index, deleteCategory } = require("../controllers/CategoryController");
const { isSignedIn, isAuthenticated, isAdmin } = require("../middlewares/auth");

const { CreateCategoryRequestValidation } = require("../validators/CategoryRouteValidations");

router.param("categoryId", getCategoryById);

router.post("/", [CreateCategoryRequestValidation()], isSignedIn, isAdmin, store);

// old
router.post('/add-category',
    [
        check("name", "name is required"),
        check("imageUrl", "Image is required"),
    ],
    isSignedIn, 
    isAdmin,
    store
)

router.post("/update-category/:categoryId", isSignedIn, isAdmin, getCategoryById, updateCategory);

router.get("/", index);

router.delete("/:categoryId", isSignedIn, isAdmin, deleteCategory);

module.exports = router;
