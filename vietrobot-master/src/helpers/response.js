/**
 * Hàm tiện ích để chuẩn hóa cấu trúc phản hồi thành công của API.
 * Nó sẽ bọc dữ liệu trả về trong một object có thuộc tính 'status' và 'data'.
 *
 * @param {any} data - Dữ liệu cần gửi về cho client (có thể là object, array, string, etc.).
 * @returns {object} Một object có cấu trúc chuẩn hóa.
 */
const response = (data) => {
    return {
        status: "success",
        data: data,
    };
};

/**
 * Response helper for successful requests
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {any} data - Response data
 */
const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
    return res.status(statusCode).json({
        status: "success",
        message: message,
        data: data
    });
};

/**
 * Response helper for error requests
 * @param {Object} res - Express response object
 * @param {Error|Object} error - Error object or custom error object
 */
const errorResponse = (res, error) => {
    // Nếu error là object với statusCode và message
    if (error && typeof error === 'object' && error.statusCode && error.message) {
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }

    // Nếu error là AppError instance
    if (error && error.statusCode) {
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }

    // Nếu error là một lỗi bình thường hoặc string
    const statusCode = error?.status || error?.statusCode || 500;
    const message = error?.message || error?.toString() || "Internal Server Error";

    return res.status(statusCode).json({
        status: "error",
        message: message
    });
};

module.exports = {
    response,
    successResponse,
    errorResponse
};