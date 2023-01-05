const usersService = require("./usersServices");
const userCache = require("../requests/usersCacheRequest");
const bcrypt = require('bcrypt');
const common = require("../common/indexOfCommon");
const { Op } = require('sequelize');


// get user
exports.userDetails = async (req, res) => {
    try {
        const userId = req.query.id;
        const userCacheData = await userCache.getCacheData(userId);
        if (userCacheData != null) {
            return res.json(JSON.parse(userCacheData));
        } else {
            const existingUser = await usersService.getUsersList({
                where: { id: userId },
                attributes: { exclude: ['password'] },
            });
            await userCache.setCacheData(userId, existingUser);
            return res.status(200).json(existingUser);
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

// get users
exports.userList = async (req, res) => {
    try {
        const { emailSearch, numberSearch, size, page } = req.query;
        let condition = {};
        if (emailSearch || numberSearch) {
            condition = {
                where: {
                    [Op.or]: [
                        { email: { [Op.like]: '%' + emailSearch + '%' } },
                        { contactNumber: { [Op.like]: '%' + numberSearch + '%' } },
                    ]
                },
                attributes: { exclude: ['password'] }
            };
        } else if (size && page) {
            condition = {
                limit: parseInt(size),
                offset: parseInt(size) * parseInt((page - 1)),
            };
        } else if (condition = {}) {
            condition = { attributes: { exclude: ['password'] } };
        }
        const users = await usersService.getUsersList(condition);
        for (var i = 0; i < users.length; i++) {
            delete users.password;
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

//  Sign Up
exports.userSignUp = async (req, res) => {
    try {
        const values = ['BUYER', 'SELLER'];
        await common.createNewUser(req, res, values);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

// log in
exports.userLogIn = async (req, res) => {
    try {
        const { password, email } = req.body;
        const users = await usersService.getUserData({ where: { email } });
        if (!users) return res.status(404).json({ error: "invalid details check again" });
        const userData = {
            firstName: users.firstName,
            lastName: users.lastName,
        }
        if (users) {
            const userPassword = users.password;
            const passwordCompare = await bcrypt.compare(password, userPassword);
            if (passwordCompare) {
                const token = common.tokenJwt(users);
                res.status(200).json({ ...userData, token });
            } else {
                res.status(404).json({ error: "invalid details" });
            }
        } else {
            res.status(404).json({ error: "invalid details" });
        }
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

// update users
exports.userUpdate = async (req, res) => {
    try {
        const body = req.body;
        const tokenId = req.user.id;
        const existingUserData = await usersService.getUserData({ where: { id: tokenId } });

        let update = {};
        if (body.firstName.length != 0) {
            update.firstName = body.firstName;
        }
        if (body.lastName.length != 0) {
            update.lastName = body.lastName;
        }
        if (existingUserData.email === body.email) {
            update.email = body.email;
        }
        if (existingUserData.contactNumber === parseInt(body.contactNumber)) {
            update.contactNumber = parseInt(body.contactNumber);
        }
        const existingContactNumberOrEmail = await usersService.getUsersList({
            where: {
                [Op.or]: [
                    { contactNumber: body.contactNumber },
                    { email: req.body.email }
                ]
            }
        });
        if ((req.body.hasOwnProperty("contactNumber")) || (req.body.hasOwnProperty("email"))) {
            if ((existingContactNumberOrEmail.length == 0) || (existingContactNumberOrEmail[0].id === tokenId)) {
                update.contactNumber = parseInt(body.contactNumber);
                update.email = body.email;
            } else {
                for (let i = 0; i < existingContactNumberOrEmail.length; i++) {
                    const element = existingContactNumberOrEmail[i];
                    if ((element.id != tokenId) && (element.contactNumber === parseInt(body.contactNumber))) {
                        return res.status(400).json({ message: "Contact Number Already Exits" });
                    }
                    if ((element.id != tokenId) && (element.email === body.email)) {
                        return res.status(400).json({ message: "Contact Email Already Exits" });
                    }
                };
            }
        };
        update.updated_at = new Date();
        const updatedData = await usersService.updateUser(existingUserData.id, update);
        const token = common.tokenJwt(updatedData);
        res.status(200).json({ ...updatedData, token });
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' })
    };
};

// change password
exports.userPasswordChange = async (req, res) => {
    try {
        const email = req.user.email;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const update = {};
        if (newPassword === confirmPassword) {
            const user = await usersService.getUserData({ where: { email } });
            bcrypt.compare(oldPassword, user.password, async (err, data) => {
                if (err) throw err;

                if (data) {
                    const salt = await bcrypt.genSalt(10);
                    update.password = await bcrypt.hash(newPassword, salt);
                    update.updated_at = new Date();
                    await usersService.updateUser(user.id, update);
                    res.status(200).json({ Message: "Your password is updated successfully" });
                } else {
                    res.status(400).json({ Message: "Your password is incorrect" });
                }
            });
        } else {
            res.status(400).json({ Message: "Password didn't match" });
        };
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

// delete users
exports.userDelete = async (req, res) => {
    try {
        const email = req.query.email;
        await usersService.deleteUser(email);
        await userCache.deleteCacheData(req.query.id, existingUser);
        res.status(200).json({ "Deleted account was": email });
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

// add admin
exports.admin = async (req, res) => {
    try {
        const values = ['ADMIN'];
        await common.createNewUser(req, res, values);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};



//get route permission 
exports.listOfRoute = async (req, res) => {
    try {
        const { operationsName, role } = req.query
        const permissionList = await usersService.listOfRoute(operationsName, role);
        res.status(200).json(permissionList);
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

//add route permission
exports.addRoute = async (req, res) => {
    try {
        let { operationsName, role, routes } = req.body;
        const existingPermission = await usersService.findOnePermission({
            where:
            {
                operationsName: operationsName,
                role: role,
            }
        });
        if (!existingPermission) {
            role = role.toUpperCase();
            routes = common.permission[operationsName];
            const permissionAdded = await usersService.addPermission({ operationsName, role, routes });
            res.status(200).json(permissionAdded);
        } else {
            res.status(403).json({ message: 'Already Exist' });
        };
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};

//delete route permission
exports.deleteRoute = async () => {
    try {
        const { operationsName, role } = req.query;
        await usersService.deletePermission(operationsName, role);
        res.status(200).json({ "Deleted id was": req.query.id });
    } catch (error) {
        res.status(403).json({ message: error + ' Server error occurred' });
    };
};