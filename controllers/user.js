const User = require("../models/user")

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