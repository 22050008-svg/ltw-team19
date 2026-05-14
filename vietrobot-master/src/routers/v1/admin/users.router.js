// /routers/v1/admin/users.router.js
const express = require("express");
const adminUserController = require("../../../controllers/admin/users.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/users
const userRouter = express.Router();

userRouter.get("/", checkPermission("system.manage.users"), adminUserController.getUsers);
userRouter.post("/", checkPermission("system.manage.users"), adminUserController.createUser);
userRouter.get("/:id", checkPermission("system.manage.users"), adminUserController.getUserDetails);
userRouter.put("/:id", checkPermission("system.manage.users"), adminUserController.updateUser);
userRouter.put("/:id/status", checkPermission("system.manage.users"), adminUserController.updateUserStatus);

module.exports = userRouter;