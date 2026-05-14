// /routers/v1/auth.router.js
const express = require("express");
const authController = require("../../controllers/auth.controller");
const authorization = require("../../middlewares/authorization");

// Path: /api/v1/auth
const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/me", authorization, authController.getProfile);

module.exports = authRouter;