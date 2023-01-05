const model = require("../models/db");
const common = require("../common/indexOfCommon");


// get order details
exports.getOrderDetails = async (buyer_id) => {
    try {
        return await model.order_product.findAll({ where: { buyer_id } });
    } catch (error) {
        return error;
    };
};

//  create order
exports.createOrder = async (orderData) => {
    try {
        return await model.order.create(orderData);
    } catch (error) {
        return error;
    };
};

//   create order product
exports.createOrderProduct = async (orderProduct) => {
    try {
        const data = await model.order_product.create(orderProduct);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};