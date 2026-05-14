// controllers/auth.controller.js
const userService = require("../services/users.service");
const authService = require("../services/auth.service");
const { response } = require("../helpers/response");

const register = async (req, res, next) => {
    try {
        const { fullName, email, password, phone } = req.body;
        const result = await authService.register({ fullName, email, password, phone });
        res.status(201).json(response(result));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { email, verificationCode } = req.body;
        const result = await authService.verifyEmail(email, verificationCode);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        // Luôn trả về 200 để không tiết lộ email nào tồn tại trong hệ thống
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const result = await authService.resetPassword(token, password);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        // req.user được gắn vào từ middleware authorization
        const { id: userId } = req.user;
        const user = await userService.getUserById(userId);
        res.status(200).json(response(user));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
};