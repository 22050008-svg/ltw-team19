// services/users.service.js
const { User, Role, sequelize, Permission } = require("../models"); // Import thêm Role và sequelize
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize"); // Import Operator để dùng cho chức năng tìm kiếm

/**
 * Lấy danh sách người dùng với bộ lọc và phân trang.
 * @param {object} filters - Các tham số lọc { search, roleId, page, limit }
 * @returns {Promise<object>} - Danh sách người dùng và thông tin phân trang.
 */
const getUsers = async (filters) => {
    try {
        const { search, roleId, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        let whereClause = {};
        let includeOptions = [{
            model: Role,
            as: 'roles',
            attributes: ['id', 'name'],
            through: { attributes: [] },
        }];

        // Xử lý bộ lọc tìm kiếm theo tên hoặc email
        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        // Xử lý bộ lọc theo vai trò (roleId)
        if (roleId) {
            includeOptions[0].where = { id: roleId };
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            distinct: true, // Quan trọng khi include many-to-many để count không bị sai
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });
        
        return {
            users: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit),
            },
        };
    } catch (error) {
        console.error("getUsers service error:", error);
        throw new AppError(500, "Không thể lấy danh sách người dùng");
    }
};

/**
 * Tạo người dùng mới và gán vai trò.
 * @param {object} userData - Dữ liệu người dùng { fullName, email, password, roleIds }
 * @returns {Promise<object>} - Người dùng vừa được tạo.
 */
const createUser = async (userData) => {
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const t = await sequelize.transaction();
    try {
        const { fullName, email, password, roleIds } = userData;

        // Tạo người dùng mới
        const newUser = await User.create({ fullName, email, password }, { transaction: t });

        // Gán các vai trò cho người dùng
        if (roleIds && roleIds.length > 0) {
            await newUser.setRoles(roleIds, { transaction: t });
        }

        // Commit transaction
        await t.commit();
        
        // Lấy lại thông tin user với roles để trả về (password đã được hook loại bỏ)
        const result = await User.findByPk(newUser.id, {
            include: [{ model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }]
        });
        return result;
    } catch (error) {
        // Rollback transaction nếu có lỗi
        await t.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError(409, "Email đã tồn tại trong hệ thống");
        }
        console.error("createUser service error:", error);
        throw new AppError(500, "Không thể tạo người dùng mới");
    }
};

/**
 * Lấy thông tin chi tiết một người dùng (dùng cho cả admin và client).
 * @param {number} userId - ID của người dùng.
 * @returns {Promise<object>} - Object chứa thông tin user và roles.
 */
const getUserDetails = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] },
            }],
        });

        if (!user) {
            throw new AppError(404, "Không tìm thấy người dùng");
        }
        
        // Tạo response sạch sẽ, nhất quán với các service khác
        const userResponse = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
        };
        const roles = user.roles || [];

        return { user: userResponse, roles };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("getUserDetails service error:", error);
        throw new AppError(500, "Không thể lấy thông tin người dùng");
    }
};

/**
 * Cập nhật thông tin và vai trò của người dùng.
 * @param {number} userId - ID người dùng.
 * @param {object} updateData - Dữ liệu cần cập nhật { fullName, roleIds }
 * @returns {Promise<object>} - Người dùng sau khi đã cập nhật.
 */
const updateUser = async (userId, updateData) => {
    const t = await sequelize.transaction();
    try {
        const { fullName, roleIds } = updateData;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError(404, "Không tìm thấy người dùng để cập nhật");
        }

        // Cập nhật thông tin cơ bản
        if (fullName) {
            user.fullName = fullName;
            await user.save({ transaction: t });
        }

        // Cập nhật vai trò (setRoles sẽ xóa các vai trò cũ và thêm mới)
        if (roleIds && Array.isArray(roleIds)) {
            await user.setRoles(roleIds, { transaction: t });
        }

        await t.commit();
        
        // Lấy lại thông tin đã cập nhật để trả về
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }]
        });
        return updatedUser;
    } catch (error) {
        await t.rollback();
        if (error instanceof AppError) {
            throw error;
        }
        console.error("updateUser service error:", error);
        throw new AppError(500, "Không thể cập nhật người dùng");
    }
};

/**
 * Cập nhật trạng thái hoạt động của người dùng.
 * @param {number} userId - ID người dùng.
 * @param {boolean} isActive - Trạng thái mới.
 * @returns {Promise<void>}
 */
const updateUserStatus = async (userId, isActive) => {
    try {
        const [affectedRows] = await User.update(
            { isActive },
            { where: { id: userId } }
        );

        if (affectedRows === 0) {
            throw new AppError(404, "Không tìm thấy người dùng để cập nhật trạng thái");
        }
        // Hàm này không cần trả về gì, controller sẽ gửi message success
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("updateUserStatus service error:", error);
        throw new AppError(500, "Không thể cập nhật trạng thái người dùng");
    }
};
const getUserById = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            // Bao gồm các mối quan hệ nếu cần, ví dụ: roles
           include: [
                           {
                               model: Role,
                               as: 'roles',
                               attributes: ['id', 'name'],
                               through: { attributes: [] }, // Quan trọng: không lấy dữ liệu từ bảng trung gian (UserRoles)
                               // THÊM ĐOẠN NÀY: Lấy kèm các quyền của mỗi vai trò
                               include: [{
                                   model: Permission,
                                   as: 'permissions', // Alias này phải khớp với định nghĩa trong model Role
                                   attributes: ['name'], // Chỉ cần lấy tên của quyền
                                   through: { attributes: [] }
                               }]
                           },
                       ],
            
        });
        if (!user) {
            throw new AppError(404, "User not found");
        }
        return user;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, error);
    }
};


module.exports = {
    getUsers,
    createUser,
    getUserDetails,
    updateUser,
    updateUserStatus,
    getUserById,
};