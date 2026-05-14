// services/profile.service.js
const bcrypt = require('bcryptjs');
// Giả định bạn có model Address được import
const { User, Address, sequelize } = require("../models");
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize"); // THÊM DÒNG NÀY VÀO
const fs = require('fs/promises');
const path = require('path');
/**
 * Cập nhật thông tin cơ bản của người dùng.
 * @param {number} userId - ID của người dùng cần cập nhật.
 * @param {object} profileData - Dữ liệu cần cập nhật (ví dụ: { fullName, phone }).
 * @returns {Promise<User>} Đối tượng người dùng đã được cập nhật.
 */
const updateProfile = async (userId, profileData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        // Cập nhật user với dữ liệu mới
        const updatedUser = await user.update(profileData);
        return updatedUser;
    } catch (error) {
        // Nếu lỗi đã là AppError, ném lại nó, ngược lại tạo lỗi 500
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to update profile");
    }
};

/**
 * Thay đổi mật khẩu cho người dùng.
 * @param {number} userId - ID của người dùng.
 * @param {string} currentPassword - Mật khẩu hiện tại để xác minh.
 * @param {string} newPassword - Mật khẩu mới.
 * @returns {Promise<object>} Một object chứa thông điệp thành công.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        // Sử dụng unscoped() để lấy cả trường password đã bị loại trừ trong defaultScope
        const user = await User.unscoped().findByPk(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        // So sánh mật khẩu hiện tại người dùng nhập vào với mật khẩu trong DB
        const isMatch = bcrypt.compareSync(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError(400, "Incorrect current password");
        }

        // Hook `set` trong model User sẽ tự động hash mật khẩu mới trước khi lưu
        user.password = newPassword;
        await user.save();

        return { message: "Password changed successfully" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to change password");
    }
};

/**
 * Lấy tất cả địa chỉ của một người dùng.
 * @param {number} userId - ID của người dùng.
 * @returns {Promise<Address[]>} Một mảng các đối tượng địa chỉ.
 */
const getAddresses = async (userId) => {
    try {
        const addresses = await Address.findAll({ where: { userId } });
        return addresses;
    } catch (error) {
        throw new AppError(500, "Failed to retrieve addresses");
    }
};

/**
 * Thêm một địa chỉ mới cho người dùng.
 * @param {number} userId - ID của người dùng.
 * @param {object} addressData - Dữ liệu của địa chỉ mới.
 * @returns {Promise<Address>} Đối tượng địa chỉ vừa được tạo.
 */
const addAddress = async (userId, addressData) => {
    const t = await sequelize.transaction();
    try {
        // Nếu địa chỉ mới được đặt làm mặc định
        if (addressData.isDefault === true) {
            // Bước 1: Bỏ trạng thái mặc định của tất cả các địa chỉ khác của user này
            await Address.update(
                { isDefault: false },
                { where: { userId }, transaction: t }
            );
        }

        // Bước 2: Tạo địa chỉ mới
        const newAddress = await Address.create({ ...addressData, userId }, { transaction: t });

        await t.commit();
        return newAddress;
    } catch (error) {
        await t.rollback();
        console.error("addAddress service error:", error);
        throw new AppError(500, "Failed to add new address");
    }
};

/**
 * Cập nhật một địa chỉ đã có.
 * @param {number} userId - ID của người dùng (để xác thực quyền).
 * @param {number} addressId - ID của địa chỉ cần cập nhật.
 * @param {object} updateData - Dữ liệu cần cập nhật.
 * @returns {Promise<Address>} Đối tượng địa chỉ đã được cập nhật.
 */
const updateAddress = async (userId, addressId, updateData) => {
    const t = await sequelize.transaction();
    try {
        const address = await Address.findOne({ where: { id: addressId, userId } });
        if (!address) {
            throw new AppError(404, "Address not found or you do not have permission to edit it");
        }

        // Nếu địa chỉ này được cập nhật thành mặc định
        if (updateData.isDefault === true) {
            // Bước 1: Bỏ trạng thái mặc định của tất cả các địa chỉ khác
            await Address.update(
                { isDefault: false },
                { where: { userId, id: { [Op.ne]: addressId } }, transaction: t } // [Op.ne] là "not equal"
            );
        }

        // Bước 2: Cập nhật địa chỉ hiện tại
        const updatedAddress = await address.update(updateData, { transaction: t });

        await t.commit();
        return updatedAddress;
    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) throw error;
        console.error("updateAddress service error:", error);
        throw new AppError(500, "Failed to update address");
    }
};


/**
 * Xóa một địa chỉ.
 * @param {number} userId - ID của người dùng (để xác thực quyền).
 * @param {number} addressId - ID của địa chỉ cần xóa.
 * @returns {Promise<void>}
 */
const deleteAddress = async (userId, addressId) => {
    try {
        const address = await Address.findOne({ where: { id: addressId, userId } });
        if (!address) {
            throw new AppError(404, "Address not found or you do not have permission to delete it");
        }

        await address.destroy();
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "Failed to delete address");
    }
};

/**
 * Cập nhật ảnh đại diện cho người dùng.
 * Đồng thời xóa ảnh cũ nếu có để tránh file rác.
 * @param {number} userId - ID của người dùng.
 * @param {string} newAvatarUrl - Đường dẫn URL mới của ảnh.
 * @returns {Promise<User>} - Người dùng sau khi đã cập nhật.
 */
const updateAvatar = async (userId, newAvatarUrl) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError(404, "Không tìm thấy người dùng để cập nhật ảnh đại diện");
        }

        const oldAvatarUrl = user.avatarUrl;

        // Cập nhật CSDL với đường dẫn ảnh mới
        user.avatarUrl = newAvatarUrl;
        await user.save();

        // Sau khi cập nhật CSDL thành công, tiến hành xóa file ảnh cũ
        if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
            // oldAvatarUrl có dạng: /uploads/images/avatars/filename.jpg
            // Cần chuyển thành đường dẫn file hệ thống
            const oldAvatarPath = path.join(__dirname, '..', oldAvatarUrl);

            try {
                await fs.unlink(oldAvatarPath);
                console.log(`[FILE_DELETE] Đã xóa ảnh đại diện cũ thành công: ${oldAvatarPath}`);
            } catch (err) {
                console.warn(`[FILE_DELETE] Không thể xóa file ảnh đại diện cũ: ${oldAvatarPath}. Lỗi: ${err.message}`);
            }
        }

        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("updateAvatar service error:", error);
        throw new AppError(500, "Không thể cập nhật ảnh đại diện");
    }
};


module.exports = {
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAvatar,
};