// Lớp AppError tùy chỉnh để tạo ra các lỗi có chủ đích và có thể dự đoán được.
// Nó kế thừa từ lớp Error sẵn có của JavaScript.
class AppError extends Error {
    /**
     * @param {number} statusCode - Mã trạng thái HTTP (ví dụ: 400, 404, 500).
     * @param {string} message - Tin nhắn lỗi rõ ràng cho client.
     */
    constructor(statusCode, message) {
        // Gọi constructor của lớp cha (Error) với message
        super(message);

        // Gán statusCode và message vào instance của lỗi
        this.statusCode = statusCode;
        this.message = message;

        // Ghi lại stack trace để dễ dàng debug, loại bỏ constructor call khỏi stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Middleware xử lý lỗi tập trung cho Express.
// Nó phải có 4 tham số (err, req, res, next) để Express nhận diện đây là middleware xử lý lỗi.
const handleErrors = (err, req, res, next) => {
    // Log lỗi ra console ở môi trường development để debug
    // Bạn có thể dùng một logger chuyên nghiệp hơn như Winston ở đây
    console.error("ERROR LOG: ", err);

    // Mặc định là lỗi server nếu không được chỉ định
    let statusCode = 500;
    let message = "Internal Server Error";

    // Nếu lỗi là một instance của AppError, chúng ta biết đó là lỗi có chủ đích.
    // Lấy thông tin từ chính lỗi đó.
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } 
    // Thêm các trường hợp lỗi cụ thể khác nếu cần
    // Ví dụ: Lỗi từ Sequelize validation
    else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400; // Bad Request
        // Lấy thông điệp lỗi từ lỗi đầu tiên trong mảng errors
        message = err.errors[0].message;
    }
    
    // Gửi phản hồi lỗi về cho client với một cấu trúc JSON nhất quán
    res.status(statusCode).json({
        status: "error",
        message: message,
    });
};

module.exports = {
    AppError,
    handleErrors,
};