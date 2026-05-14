// controllers/admin/users.controller.js
const adminUserService = require("../../services/users.service");
const { response } = require("../../helpers/response");

const getUsers = async (req, res, next) => {
    try {
        const filters = req.query; // { search, roleId }
        const users = await adminUserService.getUsers(filters);
        res.status(200).json(response(users));
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const userData = req.body; // { fullName, email, password, roleIds }
        const newUser = await adminUserService.createUser(userData);
        res.status(201).json(response(newUser));
    } catch (error) {
        next(error);
    }
};

const getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await adminUserService.getUserDetails(id);
        res.status(200).json(response(user));
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // { fullName, roleIds }
        const updatedUser = await adminUserService.updateUser(id, updateData);
        res.status(200).json(response(updatedUser));
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await adminUserService.updateUserStatus(id, isActive);
        res.status(200).json(response({ message: "Success" }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    createUser,
    getUserDetails,
    updateUser,
    updateUserStatus,
};