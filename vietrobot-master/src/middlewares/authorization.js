const jwt = require("jsonwebtoken");
const { User, Role, Permission } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Middleware để xác thực người dùng dựa trên JWT token.
 * 1. Lấy token từ header 'Authorization'.
 * 2. Xác thực token (signature, expiration).
 * 3. Tìm người dùng trong database dựa trên payload của token.
 * 4. Nếu hợp lệ, gắn object 'user' vào request và cho phép đi tiếp.
 * 5. Nếu không hợp lệ, trả về lỗi 401 Unauthorized.
 */
const authorization = async (req, res, next) => {
    try {
        console.log(`\n[AUTH] 🔐 Request: ${req.method} ${req.path}`);
        
        // --- Phần 1: Lấy và xác thực token (giữ nguyên) ---
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            console.log(`[AUTH] ❌ No Authorization header`);
            throw new AppError(401, "Unauthorized: Vui lòng cung cấp token");
        }

        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            console.log(`[AUTH] ❌ Token format invalid`);
            throw new AppError(401, "Unauthorized: Định dạng token không hợp lệ");
        }
        
        console.log(`[AUTH] ✓ Token found, verifying...`);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`[AUTH] ✓ Token valid for user ID: ${decoded.id}`);
        
        // --- Phần 2: Nâng cấp query để lấy User kèm Roles và Permissions ---
        const user = await User.findByPk(decoded.id, {
            // Include lồng nhau để lấy được permissions từ roles
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['name'], // Chỉ cần lấy tên role để debug, có thể bỏ
                through: { attributes: [] },
                include: [{
                    model: Permission,
                    as: 'permissions',
                    attributes: ['name'], // Chỉ lấy tên của quyền là đủ
                    through: { attributes: [] },
                }],
            }],
        });

        if (!user) {
            console.log(`[AUTH] ❌ User not found - ID: ${decoded.id}`);
            throw new AppError(401, "Unauthorized: Người dùng không tồn tại");
        }

        console.log(`[AUTH] ✓ User found: ${user.email}, Roles: ${user.roles.map(r => r.name).join(', ')}`);

        // --- Phần 3: Xử lý và làm phẳng danh sách permissions ---
        const permissionSet = new Set();
        if (user.roles) {
            user.roles.forEach(role => {
                if (role.permissions) {
                    role.permissions.forEach(permission => {
                        permissionSet.add(permission.name);
                    });
                }
            });
        }
        const permissions = [...permissionSet];

        console.log(`[AUTH] ✓ Permissions loaded: ${permissions.length} permissions - ${permissions.slice(0, 3).join(', ')}...`);

        // --- Phần 4: Gắn dữ liệu đã xử lý vào request ---
        // Gắn object user SẠCH (chỉ thông tin cần thiết)
        req.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
        };
        // Gắn mảng permissions đã được làm phẳng
        req.permissions = permissions;

        next();

    } catch (error) {
        // Xử lý các lỗi từ jwt.verify (TokenExpiredError, JsonWebTokenError)
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            next(new AppError(401, `Unauthorized: ${error.message}`));
        } else {
            // Chuyển các lỗi khác xuống cho handleErrors
            next(error);
        }
    }
};


module.exports = authorization;