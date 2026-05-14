const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/payment.controller");

<<<<<<< HEAD
// Route để nhận webhook từ cổng thanh toán Sebay
// Route này là public, không cần middleware xác thực người dùng (authMiddleware)
// vì nó được gọi bởi server của SePay, không phải từ client.
router.post("/webhook/sebay", paymentController.handleSebayWebhook);    

module.exports = router;

=======
/**
 * Payment Router
 * 
 * PUBLIC Routes:
 *   POST /webhook/vnpay/return - VNPay return URL
 *   POST /webhook/sebay - Sebay webhook
 */

// VNPay Return URL - Khi khách quay lại từ VNPay
// Hỗ trợ cả GET và POST
router.get("/vnpay-return", paymentController.handleVNPayReturn);
router.post("/vnpay-return", paymentController.handleVNPayReturn);

// Sebay Webhook - Xử lý callback từ Sebay
router.post("/webhook/sebay", paymentController.handleSebayWebhook);

module.exports = router;
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
