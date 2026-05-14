// controllers/profile.controller.js
const profileService = require("../services/profile.service");
const { response } = require("../helpers/response");

const updateProfile = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const profileData = req.body; // { fullName, phone }
        const updatedUser = await profileService.updateProfile(userId, profileData);
        res.status(200).json(response(updatedUser));
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { currentPassword, newPassword } = req.body;
        const result = await profileService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json(response(result));
    } catch (error){
        next(error);
    }
};

// --- Address Controllers ---

const getAddresses = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const addresses = await profileService.getAddresses(userId);
        res.status(200).json(response(addresses));
    } catch (error) {
        next(error);
    }
};

const addAddress = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const addressData = req.body;
        const newAddress = await profileService.addAddress(userId, addressData);
        // 201 Created
        res.status(201).json(response(newAddress));
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: addressId } = req.params;
        const updateData = req.body;
        const updatedAddress = await profileService.updateAddress(userId, addressId, updateData);
        res.status(200).json(response(updatedAddress));
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { id: addressId } = req.params;
        await profileService.deleteAddress(userId, addressId);
        // 204 No Content
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const updateAvatar = async (req, res, next) => {
    try {
        // Middleware Multer sẽ đặt thông tin file vào req.file
        if (!req.file) {
            throw new AppError(400, "Vui lòng tải lên một file ảnh.");
        }

        // ID người dùng được lấy từ middleware authorization
        const { id: userId } = req.user;

        // Xây dựng đường dẫn URL có thể truy cập từ web cho ảnh
        const avatarUrl = `/uploads/images/avatars/${req.file.filename}`;

        // Gọi service để cập nhật CSDL và xóa file cũ
        const updatedUser = await profileService.updateAvatar(userId, avatarUrl);

        res.status(200).json(response(updatedUser));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAvatar
};