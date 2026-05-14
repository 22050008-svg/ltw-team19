/**
 * Payment Gateway Configuration
 * Chứa các cấu hình cho các phương thức thanh toán
 */

module.exports = {
    vnpay: {
        // VNPay Configuration
        tmnCode: process.env.VNPAY_TMN_CODE || 'test-tmncode',
        secretKey: process.env.VNPAY_SECRET_KEY || 'test-secret-key',
        vnpayUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paygate',
        vnpayReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay-return',
        apiVersion: '2.1.0',
    },
    
    momo: {
        // Momo Configuration (optional)
        partnerCode: process.env.MOMO_PARTNER_CODE || '',
        accessKey: process.env.MOMO_ACCESS_KEY || '',
        secretKey: process.env.MOMO_SECRET_KEY || '',
        momoUrl: process.env.MOMO_URL || 'https://test-payment.momo.vn/v3/gateway/api/create',
    },

    paymentMethods: {
        COD: 'cod',              // Thanh toán khi nhận hàng
        VNPAY: 'vnpay',          // VNPay QR
        MOMO: 'momo',            // Momo QR
        SEBAY: 'sebay',          // Sebay (nếu còn dùng)
    },

    paymentStatus: {
        PENDING: 'pending',       // Chờ thanh toán
        SUCCEEDED: 'succeeded',   // Thành công
        FAILED: 'failed',         // Thất bại
        CANCELLED: 'cancelled',   // Đã hủy
    },
};
