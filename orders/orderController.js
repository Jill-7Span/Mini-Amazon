const orderService = require("./orderService");
const cartService = require("../carts/cartService");
const productService = require("../products/productService");


//  get order
exports.getOrder = async (req, res) => {
    try {
        const orderId = req.user.id
        const getOrderDetails = await orderService.getOrderDetails(orderId);
        res.status(200).json(getOrderDetails);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };

};

//  create order
exports.createOrder = async (req, res) => {
    try {
        const sumOfCartValue = await cartService.sum("total", { where: { buyerId } });
        const orderData = {
            buyerId: req.user.id,
            address: req.body.address,
            contactNumber: parseInt(req.body.contactNumber),
            total: sumOfCartValue,
        };
        const finalOrder = await orderService.createOrder(orderData);
        const cartItems = await cartService.getCartAllProduct(req.user.id);
        for (let i = 0; i < cartItems.length; i++) {
            const element = cartItems[i];
            const productDetails = await productService.getProduct(element.productId);
            const orderProduct = {
                orderId: finalOrder.id,
                sellerId: cartItems[i].sellerId,
                productId: cartItems[i].productId,
                quantity: cartItems[i].quantity,
                price: productDetails.price,
                total: cartItems[i].quantity * productDetails.price,
            };
            const stockUpdate = productDetails.stock - cartItems[i].quantity;
            await productService.updateProduct(productDetails.id, stockUpdate);
            await orderService.createOrderProduct(orderProduct);
            await cartService.deleteFromCart(req.user.id, cartItems[i].productId);
        };
        res.status(200).json({ message: 'Your order placed successfully, Thankyou for shopping visit again.' });
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};