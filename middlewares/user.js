const User = require("../models/user")
const jwt = require('jsonwebtoken');
const {constants} = require("../constants/index");
const _ = require("lodash");


exports.getUserById = (req, res, next, id) => {
    User.findById(id).then((user) => {
        if(!user){
            return res.status(400).json({
                error: "No users was found"
            })
        }
        req.auth = user;
        next();
    })
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
      console.log(extractedToken)
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