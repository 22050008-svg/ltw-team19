// /routers/v1/admin/roles.router.js
const express = require("express");
const adminRoleController = require("../../../controllers/admin/roles.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/
const roleRouter = express.Router();

// Route for Permissions
// Lấy danh sách roles và permissions không cần quyền đặc biệt, vì nhiều nơi cần nó để hiển thị
roleRouter.get("/roles", adminRoleController.getRoles);
roleRouter.get("/permissions", adminRoleController.getAllPermissions);

roleRouter.post("/roles", checkPermission("system.manage.roles"), adminRoleController.createRole);
roleRouter.put("/roles/:id", checkPermission("system.manage.roles"), adminRoleController.updateRole);
roleRouter.delete("/roles/:id", checkPermission("system.manage.roles"), adminRoleController.deleteRole);

module.exports = roleRouter;