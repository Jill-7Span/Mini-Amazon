const model = require("../models/db");
const { Op } = require('sequelize');
const common = require("../common/indexOfCommon");


// get cart all product
exports.getCartAllProduct = async (buyer_id) => {
    try {
        const data = await model.cart.findAll({ where: { buyer_id } });
        return common.nullCheckWithOutDataValues(data)
    } catch (error) {
        return error;
    };
};

//sum of cart value
exports.sum = async (data) => {
    try {
        const total = await model.cart.sum(data);
        return common.nullCheckWithOutDataValues(total);
    } catch (error) {
        return error;
    };
};

// add and update to cart
exports.addAndUpdateToCart = async (cartData, buyerId, productId, quantity) => {
    try {
        const foundItem = await model.cart.findOne({ where: { buyerId, productId } });
        if (!foundItem) {
            const data = await model.cart.create(cartData);
            return common.nullCheckWithDataValues(data);
        } else {
            await model.cart.update({ quantity }, { where: { buyerId, productId } });
            return common.nullCheckWithOutDataValues("quantity is updated successfully");
        };
    } catch (error) {
        return error;
    };
};

// delete cart
exports.deleteFromCart = async (buyerId, productId) => {
    try {
        return await model.cart.destroy({
            where: {
                [Op.and]: [
                    { buyerId },
                    { productId }
                ]
            }
        });
    } catch (error) {
        return error;
    };
};
