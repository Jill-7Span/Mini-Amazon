const cartService = require("./cartService");
const productService = require("../products/productService");

//  get cart
exports.getCartAllProduct = async (req, res) => {
    try {
        const cart = await cartService.getCartAllProduct(req.user.id);
        res.status(200).json(cart);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

//  add to cart
exports.addAndUpdateToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.query;
        const buyerId = req.user.id;
        const getProduct = await productService.getProduct(productId);
        if (getProduct) {
            const cartData = {
                buyerId: buyerId,
                sellerId: getProduct.sellerId,
                productId: getProduct.id,
                price: getProduct.price,
                quantity: quantity,
                total: getProduct.price * quantity,
                updated_at: new Date(),
            };
            const data = await cartService.addAndUpdateToCart(cartData, buyerId, productId, parseInt(quantity));
            res.status(200).json(data);
        } else {
            res.status(403).json({ message: "Product Not in List" });
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

//  delete to cart
exports.deleteFromCart = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const productId = req.query.productId;
        await cartService.deleteFromCart(buyerId, parseInt(productId));
        res.status(403).json({ message: "Deleted Item was " + req.query.productId });
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};
