const model = require("../models/db");
const common = require("../common/indexOfCommon");
const { Op } = require("sequelize");
const cacheData = require("../requests/usersCacheRequest");


exports.getProduct = async (condition) => {
    try {
        const data = await model.product.findOne(condition);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

// list of product
exports.getProductList = async (condition) => {
    try {
        const data = await model.product.findAll(condition)
        return common.nullCheckWithOutDataValues(data);
    } catch (error) {
        return error;
    };
};

// insert product
exports.addProduct = async (data) => {
    try {
        const newProduct = await model.product.create(data);
        await cacheData.setCacheData(newProduct.dataValues.id, data);
        return common.nullCheckWithOutDataValues(data);
    } catch (error) {
        return error;
    };
};

// update stock ,  price
exports.updateProduct = async (id, update) => {
    try {
        await model.users.update(update, { where: { id } });
        const data = await model.users.findOne({ where: { id } });
        await cacheData.setCacheData(data.dataValues.id, data);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

// delete product
exports.deleteProduct = async (id) => {
    try {
        return await model.product.destroy({ where: { id } });
    } catch (error) {
        return error;
    };
};



// Search Product
exports.getProductHistory = async (req, res) => {
    try {
        const { search, filters, limit, offset } = req.query;
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { productName: { [Op.like]: '%' + search + '%' } },
                ],
            }

        }

        if (filters) {
            if (filters.category) {
                where = {
                    ...where,
                    category: filters.category
                }
            }
            if (filters.brand) {
                where = {
                    ...where,
                    brand: filters.brand
                }
            }
            if (filters.price) {
                where = {
                    ...where,
                    price: filters.price
                }
            }

        }
        let condition = {
            where,
            order: [
                ['id', 'DESC']
            ]
        };

        if (limit && offset) {
            condition = {
                ...condition,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        }

        const productsHistory = await model.product.findAll(condition);
        const count = productsHistory ? productsHistory.length : 0
        if (productsHistory) {
            return { productsHistory, count }
        } else {
            return null
        }
    } catch (error) {
        return error;
    };
};



