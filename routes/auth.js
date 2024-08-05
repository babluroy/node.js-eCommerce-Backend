const express = require('express');
const router = express.Router();
const { check } = require('express-validator')
const { signup, signin, signout, updateUser } = require('../controllers/AuthController');
const { isAuthenticated, isSignedIn, isAdmin } = require('../middlewares/auth');
const { getUserById } = require('../middlewares/user');

router.param("userId", getUserById);

router.post('/signup',
    [
        check("email", "E-mail is required").isEmail(),
        check("password", "Password is required"),
        check("password", "Password should be atleast 6 characters").isLength({ min: 6 }),
    ],
    signup
)

router.post('/signin',
    [
        check("email", "E-mail is required").isEmail(),
        check("password", "Password is required"),
        check("password", "Password should be atleast 6 characters").isLength({ min: 6 }),
    ],
    signin
)

router.get('/signout', signout);

router.post('/update-user/:userId', updateUser);

router.post('/test', isSignedIn, isAdmin, isAuthenticated, (req, res) => {
    res.status(200).json({ msg: 'test' })
})

module.exports = router;