/**
 * VNPay Payment Gateway Service
 * Xử lý thanh toán QR code qua VNPay
 */

const crypto = require('crypto');
const { order, sequelize } = require('../models');
const paymentConfig = require('../config/payment.config');
const { AppError } = require('../helpers/error');

/**
 * Tạo checksum cho VNPay
 * @param {object} data - Dữ liệu cần mã hóa
 * @returns {string} Chữ ký HmacSHA512
 */
const createChecksum = (data) => {
    const secretKey = paymentConfig.vnpay.secretKey;
    const sortedData = Object.keys(data)
        .sort()
        .reduce((result, key) => {
            result[key] = data[key];
            return result;
        }, {});

    const signData = Object.keys(sortedData)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedData[key])}`)
        .join('&');

    return crypto
        .createHmac('sha512', secretKey)
        .update(Buffer.from(signData, 'utf-8'))
        .digest('hex');
};

/**
 * Tạo URL thanh toán VNPay
 * @param {number} orderId - ID đơn hàng
 * @param {number} amount - Số tiền (vnđ)
 * @param {string} orderInfo - Thông tin đơn hàng
 * @returns {string} URL thanh toán VNPay
 */
const createVNPayUrl = (orderId, amount, orderInfo) => {
    const baseUrl = paymentConfig.vnpay.vnpayUrl;
    const tmnCode = paymentConfig.vnpay.tmnCode;
    const returnUrl = paymentConfig.vnpay.vnpayReturnUrl;
    
    const params = {
        vnp_Version: paymentConfig.vnpay.apiVersion,
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount * 100, // VNPay tính bằng đơn vị nhỏ nhất
        vnp_CurrCode: 'VND',
        vnp_TxnRef: String(orderId),
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_CreateDate: new Date()
            .toISOString()
            .replace(/[-:T.Z]/g, '')
            .substring(0, 14),
        vnp_IpAddr: '127.0.0.1',
    };

    // Thêm secure hash
    params.vnp_SecureHash = createChecksum(params);

    // Tạo URL
    const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    return `${baseUrl}?${query}`;
};

/**
 * Xác minh response từ VNPay
 * @param {object} vnpParams - Các tham số từ VNPay gửi về
 * @returns {boolean} true nếu hợp lệ
 */
const verifyVNPayResponse = (vnpParams) => {
    const vnpSecureHash = vnpParams.vnp_SecureHash;
    const secureHashType = vnpParams.vnp_SecureHashType || 'SHA512';

    // Loại bỏ các field không cần thiết
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const checksum = createChecksum(vnpParams);
    return checksum === vnpSecureHash;
};

module.exports = {
    createVNPayUrl,
    verifyVNPayResponse,
    createChecksum,
};
