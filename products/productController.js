const productService = require("./productService");
const cacheData = require("../requests/usersCacheRequest")
const { Op } = require("sequelize");

// get Product
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.query;
        const productCache = await cacheData.getCacheData(id, product);
        if (productCache != null) {
            return res.json(JSON.parse(productCache));
        } else {
            const product = await productService.getProduct({ where: { id } });
            await userCache.setCacheData(id, product);
            res.status(200).json(product);
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Product Not Found!' });
    }
};

// list of product
exports.productList = async (req, res) => {
    try {
        const { productId, sellerId, productName, size, page } = req.query;
        let condition = {};
        if ((productId || sellerId) || (productId ? sellerId : productName) || (sellerId && productName) || (productName)) {
            condition = {
                where: {
                    [Op.or]: [
                        { id: { [Op.like]: '%' + productId + '%' } },
                        { sellerId: { [Op.like]: '%' + sellerId + '%' } },
                        { productName: { [Op.like]: '%' + productName + '%' } },
                    ],
                },
            };
        } else if (size && page) {
            condition = {
                limit: parseInt(size),
                offset: parseInt(size) * parseInt((page - 1)),
                attributes: { exclude: ['password'] },
            };
        } else if (condition = {}) {
            condition = { attributes: { exclude: ['password'] } };
        }
        const users = await productService.getProductList(condition);
        res.status(200).json(users);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    }
};

// add product
exports.addProduct = async (req, res) => {
    try {
        const data = req.body;
        data.sellerId = req.user.id;
        let condition = {
            where: {
                [Op.and]:
                    [
                        { sellerId: req.user.id },
                        { productName: data.productName },
                        { brand: data.brand },
                        { category: data.category },
                        { price: data.price }
                    ]
            }
        };
        const isProductExist = await productService.getProduct(condition);
        if (isProductExist == null) {
            const product = await productService.addProduct(data);
            res.status(403).json(product);
        } else {
            res.status(403).json({ message: ' Product Already Exits' });
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurRed' });
    }
};

// update Product
exports.updateProduct = async (req, res) => {
    try {
        const { id, description, price, stock } = req.query;
        const isProductExist = await productService.getProduct({ where: { id } });
        if (isProductExist) {
            const update = {
                description: description,
                price: price,
                stock: stock,
                updated_at: new Date(),
            };
            const updatedProduct = await productService.updateProduct(id, update);
            res.status(200).json(updatedProduct);
        } else {
            res.status(403).json({ message: ' Product Not Found!' });
        }
    } catch (error) {
        res.status(403).json({
            message: error + `You can't update the product because Product not exist in the product list`
        });
    }
};

// delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.query;
        const isProductExist = await productService.getProduct({ where: { id: productId } });
        if (isProductExist) {
            await productService.deleteProduct(productId);
            await cacheData.deleteCacheData(productId);
            res.status(200).json({ "Deleted account was = ": productId });
        } else {
            res.status(403).json({ message: 'Product Not in List or Deleted!' });
        }
    } catch (error) {
        res.status(403).json({ message: error + 'Product Not Found!' });
    }
};




// filter Product
exports.productHistory = async (req, res) => {
    try {
        const result = await productService.getProductHistory(req, res);
        if (result) {
            res.status(200).json({
                message: result.productsHistory,
                count: result.count
            });
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    }
};
