// /routers/v1/profile.router.js
const express = require("express");
const profileController = require("../../controllers/profile.controller");
const authorization = require("../../middlewares/authorization");
const { uploadAvatar } = require("../../middlewares/multerConfig");

// Base URL: /api/v1/profile
const profileRouter = express.Router();

// Áp dụng middleware xác thực cho tất cả các route trong file này.
// Yêu cầu người dùng phải đăng nhập để truy cập bất kỳ endpoint nào dưới đây.
profileRouter.use(authorization);

// --- User Profile Routes ---

// Endpoint: PUT /api/v1/profile/
// Chức năng: Cập nhật thông tin cá nhân (họ tên, số điện thoại).
profileRouter.put("/", profileController.updateProfile);

// Endpoint: PUT /api/v1/profile/password
// Chức năng: Đổi mật khẩu.
profileRouter.put("/password", profileController.changePassword);

// Endpoint: PUT /api/v1/profile/avatar
// Chức năng: Cập nhật ảnh đại diện.
profileRouter.put(
    "/avatar",
    uploadAvatar.single("avatar"),
    profileController.updateAvatar
);


// --- Address Management Routes ---

// Endpoint: GET /api/v1/profile/addresses
// Chức năng: Lấy danh sách tất cả địa chỉ của người dùng.
profileRouter.get("/addresses", profileController.getAddresses);

// Endpoint: POST /api/v1/profile/addresses
// Chức năng: Thêm một địa chỉ mới.
profileRouter.post("/addresses", profileController.addAddress);

// Endpoint: PUT /api/v1/profile/addresses/:id
// Chức năng: Cập nhật một địa chỉ cụ thể bằng ID.
profileRouter.put("/addresses/:id", profileController.updateAddress);

// Endpoint: DELETE /api/v1/profile/addresses/:id
// Chức năng: Xóa một địa chỉ cụ thể bằng ID.
profileRouter.delete("/addresses/:id", profileController.deleteAddress);


module.exports = profileRouter;