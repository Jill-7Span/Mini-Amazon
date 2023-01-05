const express = require('express');
const router = express.Router();
const users = require("../users/users");
const product = require("../products/product");
const cart = require("../carts/cart");
const order = require("../orders/order");
const s3Image = require("../File_System/s3")

// Routes
router.use("/users", users);

router.use("/product", product);

router.use("/cart", cart);

router.use("/order", order);

router.use("/test",users);

router.use("/img",s3Image)


module.exports = router;


