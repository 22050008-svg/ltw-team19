const express = require("express");

// Controller
const cartController = require("../../controllers/cart.controller");

// Middlewares
const authorization = require("../../middlewares/authorization");

// Base URL: /api/v1/cart
const cartRouter = express.Router();

// --- ÁP DỤNG MIDDLEWARE XÁC THỰC ---
// Tất cả các route trong file này sẽ đi qua middleware `authorization` trước tiên.
// Nếu token không hợp lệ, request sẽ bị chặn và trả về lỗi 401.
// Nếu hợp lệ, thông tin user sẽ được gắn vào `req.user` và request được đi tiếp.
cartRouter.use(authorization);

// --- ĐỊNH NGHĨA CÁC ROUTE CHO GIỎ HÀNG ---

// Chức năng: Xem giỏ hàng hiện tại của người dùng đã đăng nhập.
// Method: GET
// Endpoint: /api/v1/cart/
cartRouter.get("/", cartController.viewCart);

// Chức năng: Thêm một sản phẩm mới vào giỏ hoặc cập nhật số lượng nếu đã tồn tại.
// Method: POST
// Endpoint: /api/v1/cart/items
cartRouter.post("/items", cartController.addOrUpdateItem);

// Chức năng: Xóa một biến thể sản phẩm khỏi giỏ hàng.
// ★ THAY ĐỔI: :productId -> :variantId
// Method: DELETE
// Endpoint: /api/v1/cart/items/:variantId
cartRouter.delete("/items/:variantId", cartController.removeItem);

// Chức năng: Xóa toàn bộ sản phẩm khỏi giỏ hàng (làm trống giỏ hàng).
// Method: DELETE
// Endpoint: /api/v1/cart/
cartRouter.delete("/", cartController.clearCart);


module.exports = cartRouter;