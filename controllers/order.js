const { constants } = require("../constants");
const { getUserData } = require("../middlewares/auth");
const { ProductCart, Order } = require("../models/order");
const { checkStock, subtractStock } = require("./product");

exports.addToCart = (req, res) => {
    const { productId, quantity } = req.body;
    const userData = getUserData(req.headers.authorization);

    if (!userData) {
        res.status(502).json({
            error: "Error retrieving user details"
        })
    }

    if (!productId || !quantity) {
        return res.status(400).json({
            error: "Product or quantity is missing"
        })
    }

    const preparedData = {
        product: productId,
        quantity: quantity,
        user: userData?.id,
    };

    const cartData = new ProductCart(preparedData)
    
    cartData.save().then((addedProduct) => {
        return res.status(200).json({
            data: addedProduct,
            message: "Product addeed into cart"
        })
    }).catch((err) => {
        return res.status(502).json({
            log: err,
            error: "Unknown Error"
        })
    })

}

exports.removeFromCart = (req, res) => {
    const cartProductId = req.params.cartProductId;
    ProductCart.findByIdAndDelete(cartProductId).then((product) => {
        return res.status(200).json({
            data: product,
            message: "Product has been deleted"
        })
    })
}

exports.getCartProducts = async (req, res) => {
    let { pageNumber, limit, sortBy } = req.query;
    if (!pageNumber) pageNumber = 1;
    if (!limit || limit > 100) limit = 9;
    const limit_query = parseInt(limit);
    const skip = (pageNumber - 1) * limit;
    sortBy = sortBy ? sortBy : "_id";

    try {
        const cart = await ProductCart.find()
            .sort([[sortBy, "desc"]])
            .skip(skip)
            .limit(limit_query)
            .exec();
        res.status(200).json(cart);
    } catch (err) {
        res.status(400).json({
            log: err,
            error: "Cart not found"
        });
    }
}

exports.getAllOrders = async (req, res) => {
    let { pageNumber, limit, sortBy } = req.query;
    if (!pageNumber) pageNumber = 1;
    if (!limit || limit > 100) limit = 9;
    const limit_query = parseInt(limit);
    const skip = (pageNumber - 1) * limit;
    sortBy = sortBy ? sortBy : "_id";

    try {
        const products = await Order.find()
            .sort([[sortBy, "desc"]])
            .skip(skip)
            .limit(limit_query)
            .exec();
        res.status(200).json(products);
    } catch (err) {
        res.status(400).json({
            error: "Products not found"
        });
    }
}


exports.order = async (req, res) => {
    const { paymentMode } = req.body;

    if(!paymentMode) {
        return res.status(400).json({
            error: "Payment mode required",
        });
    }

    try {
        const userData = getUserData(req.headers.authorization);

        const cartProducts = await ProductCart.find({ user: userData.id });

        if (cartProducts.length === 0) {
            return res.status(404).json({
                error: "No products found in cart"
            });
        }

        const productIds = cartProducts.map(item => item.product);
        const productQtys = cartProducts.map(item => item.quantity);

        const isStockAvailable = await checkStock(productIds, productQtys);

        if (!isStockAvailable) {
            return res.status(400).json({
                error: "Insufficient stock"
            });
        }

        const preparedData = {
            products: cartProducts,
            paymentMode: paymentMode,
            user: userData.id,
        };

        const orderData = new Order(preparedData);
        const savedOrder = await orderData.save();

        await subtractStock(productIds, productQtys);
        await this.clearCart(userData.id);

        return res.status(200).json({
            data: savedOrder,
            message: "Successfully Ordered"
        });

    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            details: err.message
        });
    }
}


exports.clearCart = (userId) => {
    if (!userId) {
        return false;
    }
    ProductCart.deleteMany({ user: userId })
        .then((result) => {
            return (true)
        })
        .catch((error) => {
            return (false)
        });
};