const express = require('express');
const router =  express.Router();
const { check } = require('express-validator');
const { isSignedIn, isAuthenticated, isAdmin } = require('../middlewares/auth');
const { getSignedUrl } = require('../controllers/common');

router.post('/get-signed-url',
    isSignedIn, isAdmin,
    getSignedUrl
)

module.exports = router;