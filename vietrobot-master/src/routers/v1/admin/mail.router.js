const express = require("express");
const mailController = require("../../../controllers/admin/mail.controller");
const { checkPermission } = require("../../../middlewares/permission.middleware");

// Path: /api/v1/admin/mail
const mailRouter = express.Router();

// Áp dụng middleware check quyền 'manage_system' cho tất cả các route
mailRouter.use(checkPermission("system.manage.settings"));

mailRouter.get("/", mailController.getMailConfig);
mailRouter.put("/", mailController.updateMailConfig);
mailRouter.post("/test", mailController.sendTestEmail);

module.exports = mailRouter;