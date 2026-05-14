// services/admin/roles.service.js
const { Op } = require("sequelize");
const { sequelize, User, Role, Permission } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Lấy danh sách tất cả các vai trò và các quyền hạn liên quan.
 * @returns {Promise<Role[]>} Mảng các đối tượng vai trò.
 */
const getRoles = async () => {
    try {
        const roles = await Role.findAll({
            // Bao gồm model Permission thông qua bảng trung gian
            include: [{
                model: Permission,
                as: 'permissions', // Sử dụng alias đã định nghĩa trong model relationships
                // Không hiển thị các thuộc tính của bảng trung gian (RolePermissions) trong kết quả
                through: { attributes: [] } 
            }],
            order: [['id', 'ASC']]
        });
        return roles;
    } catch (error) {
        console.error("Error in getRoles service: ", error);
        throw new AppError(500, "Failed to retrieve roles");
    }
};

/**
 * Tạo một vai trò mới và gán các quyền hạn cho nó.
 * Sử dụng transaction để đảm bảo tất cả các thao tác thành công hoặc không có gì cả.
 * @param {object} roleData - Dữ liệu cho vai trò mới.
 * @param {string} roleData.name - Tên của vai trò.
 * @param {string} roleData.description - Mô tả vai trò.
 * @param {number[]} roleData.permissionIds - Mảng các ID của quyền hạn cần gán.
 * @returns {Promise<Role>} Đối tượng vai trò vừa được tạo.
 */
const createRole = async (roleData) => {
    // Bắt đầu một transaction
    const t = await sequelize.transaction();
    try {
        const { name, description, permissionIds } = roleData;

        // 1. Kiểm tra xem tên vai trò đã tồn tại chưa
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            throw new AppError(400, "Role name already exists");
        }

        // 2. Tạo vai trò mới bên trong transaction
        const newRole = await Role.create({ name, description }, { transaction: t });

        // 3. Nếu có permissionIds được cung cấp, gán chúng cho vai trò mới
        if (permissionIds && permissionIds.length > 0) {
            // `setPermissions` là một method đặc biệt của Sequelize
            // nó sẽ xóa các liên kết cũ (nếu có) và tạo các liên kết mới trong bảng trung gian.
            await newRole.setPermissions(permissionIds, { transaction: t });
        }

        // 4. Nếu mọi thứ thành công, commit transaction
        await t.commit();

        // 5. Lấy lại vai trò vừa tạo cùng với các quyền hạn để trả về response đầy đủ
        const result = await Role.findByPk(newRole.id, {
            include: [{
                model: Permission,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        return result;

    } catch (error) {
        // 6. Nếu có bất kỳ lỗi nào, rollback tất cả các thay đổi
        await t.rollback();
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in createRole service: ", error);
        throw new AppError(500, "Failed to create new role");
    }
};



/**
 * Cập nhật thông tin và quyền hạn của một vai trò.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param {number} roleId - ID của vai trò cần cập nhật.
 * @param {object} updateData - Dữ liệu cần cập nhật.
 * @returns {Promise<Role>} Đối tượng vai trò sau khi đã cập nhật.
 */
const updateRole = async (roleId, updateData) => {
    const t = await sequelize.transaction();
    try {
        const { name, description, permissionIds } = updateData;

        // 1. Tìm vai trò cần cập nhật
        const role = await Role.findByPk(roleId, { transaction: t });
        if (!role) {
            throw new AppError(404, "Role not found");
        }

        // 2. Nếu tên được cập nhật, kiểm tra xem tên mới có bị trùng với vai trò khác không
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({
                where: {
                    name,
                    id: { [Op.ne]: roleId } // Tìm các vai trò có tên trùng nhưng ID khác
                }
            });
            if (existingRole) {
                throw new AppError(400, "Role name already in use by another role");
            }
        }

        // 3. Cập nhật thông tin cơ bản của vai trò
        await role.update({ name, description }, { transaction: t });

        // 4. Cập nhật lại toàn bộ danh sách quyền hạn.
        // `setPermissions` sẽ tự động xóa các quyền cũ và thêm các quyền mới.
        if (permissionIds && Array.isArray(permissionIds)) {
            await role.setPermissions(permissionIds, { transaction: t });
        }

        // 5. Commit transaction
        await t.commit();

        // 6. Lấy lại vai trò với thông tin cập nhật đầy đủ để trả về
        const result = await Role.findByPk(roleId, {
            include: [{
                model: Permission,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        return result;

    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in updateRole service: ", error);
        throw new AppError(500, "Failed to update role");
    }
};

const deleteRole = async (roleId) => {
    const role = await Role.findByPk(roleId);
    if (!role) {
        throw new AppError(404, "Role not found");
    }

    // Kiểm tra xem có người dùng nào đang được gán vai trò này không
    const userCount = await User.count({
        include: [{
            model: Role,
            as: 'roles', // Thêm bí danh 'roles' vào đây
            where: { id: roleId },
            through: { attributes: [] } // Bỏ qua bảng trung gian UserRoles
        }]
    });

    if (userCount > 0) {
        throw new AppError(400, `Không thể xóa vai trò này vì đang có ${userCount} người dùng được gán.`);
    }

    // Nếu không có người dùng nào, tiến hành xóa vai trò
    // Xóa các liên kết trong bảng RolePermissions trước
    await role.setPermissions([]);

    // Sau đó xóa vai trò
    await role.destroy();

    return { message: "Role deleted successfully" };
};

/**
 * Lấy danh sách tất cả các quyền hạn có sẵn trong hệ thống.
 * @returns {Promise<Permission[]>} Mảng các đối tượng quyền hạn.
 */
const getAllPermissions = async () => {
    try {
        const permissions = await Permission.findAll({
            order: [['name', 'ASC']]
        });
        return permissions;
    } catch (error) {
        console.error("Error in getAllPermissions service: ", error);
        throw new AppError(500, "Failed to retrieve permissions");
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions,
};