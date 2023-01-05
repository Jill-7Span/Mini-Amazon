const model = require("../models/db");
const common = require("../common/indexOfCommon");
const userCache = require("../requests/usersCacheRequest");


//get user
exports.getUserData = async (condition) => {
    try {
        const data = await model.users.findOne(condition);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

// get users
exports.getUsersList = async (condition) => {
    try {
        const data = await model.users.findAll(condition);
        return common.nullCheckWithOutDataValues(data);
    } catch (error) {
        return error;
    };
};

// sign up users
exports.creteUser = async (data) => {
    try {
        const newUserData = await model.users.create(data);
        delete newUserData.dataValues.password;
        await userCache.setCacheData(newUserData.dataValues.id, newUserData.dataValues);
        return common.nullCheckWithDataValues(newUserData);
    } catch (error) {
        return error;
    };
};

// update users
exports.updateUser = async (id, update) => {
    try {
        await model.users.update(update, { where: { id } });
        const data = await model.users.findOne({ where: { id }, attributes: { exclude: ['password'] }, });
        await userCache.setCacheData(data.dataValues.id, data.dataValues);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

// delete users
exports.deleteUser = async (email) => {
    try {
        return await model.users.destroy({ where: { email } });
    } catch (error) {
        return error;
    };
};



// list of permission route
exports.listOfRoute = async (operationsName, role) => {
    try {
        let condition = {};
        if (operationsName) {
            condition = { where: { operationsName } }
        };
        if (role) {
            condition = { where: { role } }
        };
        const listOfPermission = await model.permission.findAll(condition);
        return common.nullCheckWithOutDataValues(listOfPermission);
    } catch (error) {
        return error;
    };
};

//find one route or permission name
exports.findOnePermission = async (condition) => {
    try {
        const data = await model.permission.findOne(condition);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

// add permission route
exports.addPermission = async ({ operationsName, role, routes }) => {
    try {
        const bodyData = { operationsName, role, routes };
        const data = await model.permission.create(bodyData);
        return common.nullCheckWithDataValues(data);
    } catch (error) {
        return error;
    };
};

//delete permission route
exports.deletePermission = async (operationsName, role) => {
    try {
        return await model.users.destroy({ where: { operationsName, role } });
    } catch (error) {
        return error;
    };
};