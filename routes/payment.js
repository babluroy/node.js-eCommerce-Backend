const express = require('express');
const router = express.Router();
const { createOrder, validatePayment } = require('../controllers/PaymentController');
const { isSignedIn } = require('../middlewares/auth');

router.post('/create-order', isSignedIn, createOrder);

router.post('/validate-payment', isSignedIn, validatePayment);

module.exports = router;