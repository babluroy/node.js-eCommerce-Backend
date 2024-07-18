const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {constants} = require("../constants/index");
const _ = require("lodash");

exports.isSignedIn = (req, res, next) => {
    const secret = process.env.SECRET;
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Missing JWT' });
    }
    jwt.verify(token, secret, { algorithms: ["sha1", "RS256", "HS256"] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized - Invalid JWT' });
      }
      req.auth = decoded;
      next();
    });
}

exports.isAdmin = (req, res, next) => {
    if(req.auth.userType === constants.USER_TYPES.USER) {
        return res.status(401).json({
          error: "You are not an admin ! Access Denied",
        })
    } 
    next();
}

exports.isAuthenticated = (req, res, next) => {
  let checker = req.auth && req.auth._id == req.auth.id;
  if(!checker) {
    return res.status(401).json({
      error: "ACCCESS DENIED"
    })
  }
  next();
}

exports.getUserData = (token) => {
  let result = null;
  const extractedToken = token ? token.split(' ')[1] : null;
  if (!token) {
    result = null;
    return result;
  }
  const secretKey = process.env.SECRET;
  try {
    const decoded = jwt.verify(extractedToken, secretKey);
    result = decoded;
    return result;
  } catch (err) {
    result = null;
    return result;
  }
}

exports.isBasicUserDetailExists = (req, res, next) => {
  const userData = this.getUserData(req.headers.authorization);
  User.findById(userData.id).then((data) => {
    if (
      _.isEmpty(data?.address?.city) ||
      _.isEmpty(data?.address?.state) ||
      _.isEmpty(data?.address?.address) ||
      _.isEmpty(data?.address?.pin) ||
      _.isEmpty(data?.phoneNumber) || 
      _.isEmpty(data?.firstname)  
    ) {
      return res.status(401).json({
        error: "Name, Address & Phone number is required",
      })
    }
    next()
  }).catch((err) => {
    return res.status(401).json({
      log: err,
      error: "Unknown error",
    })
  })
}