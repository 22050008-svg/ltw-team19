/**
 * Permission Check Middleware
 * Kiểm tra quyền hạn trước khi thực hiện hành động
 */

const { AppError } = require('../helpers/error');
const { User, Role, Permission } = require('../models');

/**
 * Middleware để kiểm tra xem user có permission cụ thể không
 * @param {string} requiredPermission - Tên permission cần kiểm tra (vd: 'product.create')
 * @returns {Function} Middleware function
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra user đã login chưa
      if (!req.user || !req.user.id) {
        console.log(`[PERMISSION] ⚠️  No user in request - Method: ${req.method} ${req.path}`);
        throw new AppError(401, 'Vui lòng đăng nhập');
      }

      console.log(`[PERMISSION] 🔍 Checking "${requiredPermission}" for user ${req.user.id} - ${req.method} ${req.path}`);

      // Lấy user kèm roles và permissions
      const user = await User.findByPk(req.user.id, {
        include: {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        }
      });

      if (!user) {
        console.log(`[PERMISSION] ❌ User not found in database - ID: ${req.user.id}`);
        throw new AppError(401, 'User không tồn tại');
      }

      console.log(`[PERMISSION] ✓ User found: ${user.email}, Roles: ${user.roles.map(r => r.name).join(', ')}`);

      // Kiểm tra user có role nào không
      if (!user.roles || user.roles.length === 0) {
        console.log(`[PERMISSION] ❌ User has no roles assigned`);
        throw new AppError(403, 'User chưa được gán role');
      }

      // Kiểm tra xem user có permission cần thiết không
      let hasPermission = false;
      let foundInRole = null;
      
      for (const role of user.roles) {
        console.log(`[PERMISSION]   Checking role "${role.name}" - has ${role.permissions.length} permissions`);
        
        // Kiểm tra permission trong mỗi role
        const hasPermInRole = role.permissions.some(
          p => p.name === requiredPermission
        );
        
        if (hasPermInRole) {
          hasPermission = true;
          foundInRole = role.name;
          console.log(`[PERMISSION]   ✓ Found "${requiredPermission}" in role "${role.name}"`);
          break;
        } else {
          const availablePerms = role.permissions.map(p => p.name).slice(0, 3).join(', ');
          console.log(`[PERMISSION]   ✗ "${requiredPermission}" not in "${role.name}" - available: ${availablePerms}...`);
        }
      }

      if (!hasPermission) {
        console.warn(`[PERMISSION] ❌ DENIED - User ${user.id} lacks permission "${requiredPermission}"`);
        throw new AppError(
          403, 
          `⛔ Bạn không có quyền: ${requiredPermission}`
        );
      }

      console.log(`[PERMISSION] ✅ ALLOWED - User has permission from role "${foundInRole}"`);


      // Lưu user vào request để sử dụng tiếp
      req.user = user;
      next();

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ 
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        error: error.message || 'Internal Server Error' 
      });
    }
  };
};

/**
 * Middleware để kiểm tra xem user có một trong nhiều permissions không
 * @param {Array<string>} permissions - Danh sách permissions (hoặc 1 trong các permission này)
 * @returns {Function} Middleware function
 */
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        throw new AppError(401, 'Vui lòng đăng nhập');
      }

      const user = await User.findByPk(req.user.id, {
        include: {
          model: Role,
          as: 'roles',
          include: {
            model: Permission,
            as: 'permissions'
          }
        }
      });

      if (!user || user.roles.length === 0) {
        throw new AppError(403, 'Không có quyền truy cập');
      }

      // Kiểm tra user có 1 trong các permissions
      let hasAnyPermission = false;
      
      for (const role of user.roles) {
        for (const permission of role.permissions) {
          if (permissions.includes(permission.name)) {
            hasAnyPermission = true;
            break;
          }
        }
        if (hasAnyPermission) break;
      }

      if (!hasAnyPermission) {
        throw new AppError(
          403, 
          `⛔ Bạn cần 1 trong các quyền: ${permissions.join(', ')}`
        );
      }

      req.user = user;
      next();

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware để kiểm tra xem user có tất cả permissions không
 * @param {Array<string>} permissions - Danh sách permissions (cần cả vài quyền này)
 * @returns {Function} Middleware function
 */
const checkAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        throw new AppError(401, 'Vui lòng đăng nhập');
      }

      const user = await User.findByPk(req.user.id, {
        include: {
          model: Role,
          as: 'roles',
          include: {
            model: Permission,
            as: 'permissions'
          }
        }
      });

      if (!user || user.roles.length === 0) {
        throw new AppError(403, 'Không có quyền truy cập');
      }

      // Lấy tất cả permissions của user
      const userPermissions = new Set();
      user.roles.forEach(role => {
        role.permissions.forEach(p => userPermissions.add(p.name));
      });

      // Kiểm tra user có tất cả permissions
      const hasAllPermissions = permissions.every(p => 
        userPermissions.has(p)
      );

      if (!hasAllPermissions) {
        throw new AppError(
          403, 
          `⛔ Bạn cần các quyền: ${permissions.join(', ')}`
        );
      }

      req.user = user;
      next();

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware để kiểm tra xem user có role cụ thể không
 * @param {string|Array<string>} roles - Role name(s) cần kiểm tra
 * @returns {Function} Middleware function
 */
const checkRole = (roles) => {
  const roleList = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        throw new AppError(401, 'Vui lòng đăng nhập');
      }

      const user = await User.findByPk(req.user.id, {
        include: {
          model: Role,
          as: 'roles',
          attributes: ['name']
        }
      });

      if (!user || user.roles.length === 0) {
        throw new AppError(403, 'User chưa được gán role');
      }

      const userRoles = user.roles.map(r => r.name);
      const hasRole = roleList.some(role => userRoles.includes(role));

      if (!hasRole) {
        throw new AppError(
          403, 
          `⛔ Chỉ có roles sau mới được phép: ${roleList.join(', ')}`
        );
      }

      req.user = user;
      next();

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  checkPermission,      // Kiểm tra 1 permission
  checkAnyPermission,   // Kiểm tra 1 trong nhiều permissions
  checkAllPermissions,  // Kiểm tra tất cả permissions
  checkRole             // Kiểm tra role
};
