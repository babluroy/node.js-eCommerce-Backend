const express = require('express');
const router = express.Router();
const { createOrder, validatePayment, testValiDatePayment } = require('../controllers/PaymentController');
const { isSignedIn } = require('../middlewares/auth');

router.post('/create-order', isSignedIn, createOrder);

router.post('/validate-payment', isSignedIn, validatePayment);

router.post('/test-validate-payment', isSignedIn, testValiDatePayment);

module.exports = router;