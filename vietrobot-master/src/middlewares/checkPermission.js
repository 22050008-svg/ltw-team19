// ví dụ file middlewares/checkPermission.js
const checkPermission = (permission) => {
  return (req, res, next) => {
    // Giả sử req.user đã được gắn bởi middleware authorization
    // và có chứa một mảng các quyền (permissions)
    const userPermissions = req.permissions || [];

    if (userPermissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden: You don't have enough permissions." });
  };
};

module.exports = checkPermission;