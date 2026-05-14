// services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const mailService = require('./mail.service');
const { User, Role, UserRoles, Permission } = require("../models");
const { AppError } = require("../helpers/error");

const register = async (data) => {
    try {
        const user = await User.findOne({ where: { email: data.email } });
        if (user) {
            throw new AppError(409, "Email đã tồn tại");
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const newUser = await User.create({
            ...data,
            verificationCode,
            verificationCodeExpires,
        });

        // Gửi email xác thực
        await mailService.sendMail({
            to: newUser.email,
            subject: 'Xác thực tài khoản Vietrobot',
            html: `
                <h1>Chào mừng bạn đến với Vietrobot!</h1>
                <p>Mã xác thực tài khoản của bạn là:</p>
                <h2 style="text-align:center; letter-spacing: 5px;">${verificationCode}</h2>
                <p>Mã này sẽ hết hạn sau 10 phút.</p>
                <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
            `
        });

        return { message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực." };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Register service error:", error);
        throw new AppError(500, "Đã có lỗi xảy ra ở phía máy chủ");
    }
};

const login = async (credentials) => {
    try {
        const { email, password } = credentials;

        // BƯỚC 1: TÌM USER VÀ LẤY KÈM CÁC ROLES TƯƠNG ỨNG
        // Dùng .unscoped() để bỏ qua defaultScope, lấy về cả trường password để xác thực.
        const user = await User.unscoped().findOne({
            where: { email },
            // Include để lấy dữ liệu từ bảng có quan hệ
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // Quan trọng: không lấy dữ liệu từ bảng trung gian (UserRoles)
                    // THÊM ĐOẠN NÀY: Lấy kèm các quyền của mỗi vai trò
                    include: [{
                        model: Permission,
                        as: 'permissions', // Alias này phải khớp với định nghĩa trong model Role
                        attributes: ['name'], // Chỉ cần lấy tên của quyền
                        through: { attributes: [] }
                    }]
                },
            ],
        });
        
        // Nếu không tìm thấy user theo email, trả về lỗi
        if (!user) {
            throw new AppError(401, "Email hoặc mật khẩu không chính xác");
        }

        // Kiểm tra xem tài khoản đã được kích hoạt chưa
        if (!user.isVerified) {
            throw new AppError(403, "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email.");
        }

        // Kiểm tra xem tài khoản có bị khóa không
        if (!user.isActive) {
            throw new AppError(403, "Tài khoản của bạn đã bị khóa.");
        }

        // So sánh mật khẩu người dùng nhập với mật khẩu đã hash trong database
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            throw new AppError(401, "Email hoặc mật khẩu không chính xác");
        }

        // BƯỚC 2: TẠO TOKEN VÀ CHUẨN BỊ DỮ LIỆU TRẢ VỀ
        // Tạo JWT với payload chứa thông tin định danh user
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        
        // Tạo một đối tượng user sạch, không chứa password để trả về cho client
        const userResponse = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            avatarUrl: user.avatarUrl,
        };

        // BƯỚC 3: TRẢ VỀ CẤU TRÚC DỮ LIỆU HOÀN CHỈNH CHO FRONT-END
        // Gắn mảng roles trực tiếp vào đối tượng user để frontend dễ dàng sử dụng
        return { 
            token, 
            user: {
                ...userResponse,
                roles: user.roles || [], // Gắn roles vào đây
            }
        };

    } catch (error) {
        // Xử lý lỗi tập trung
        if (error instanceof AppError) {
            throw error;
        }
        // Ghi lại lỗi không mong muốn để debug
        console.error("Login service error:", error);
        throw new AppError(500, "Đã có lỗi xảy ra ở phía máy chủ");
    }
};

const verifyEmail = async (email, verificationCode) => {
    try {
        // Tìm người dùng chưa được xác thực với mã code tương ứng
        const user = await User.unscoped().findOne({
            where: {
                email,
                verificationCode,
                isVerified: false,
            }
        });

        if (!user) {
            throw new AppError(400, "Mã xác thực không hợp lệ hoặc tài khoản đã được xác thực.");
        }

        // Kiểm tra mã đã hết hạn chưa
        if (user.verificationCodeExpires < new Date()) {
            throw new AppError(400, "Mã xác thực đã hết hạn.");
        }

        // Cập nhật người dùng
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        return { message: "Xác thực tài khoản thành công. Bây giờ bạn có thể đăng nhập." };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Verify email service error:", error);
        throw new AppError(500, "Đã có lỗi xảy ra ở phía máy chủ");
    }
};

const forgotPassword = async (email) => {
    try {
        const user = await User.unscoped().findOne({ where: { email } });
        // Luôn trả về thông báo thành công để tránh email enumeration attacks
        if (!user) {
            return { message: "Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để đặt lại mật khẩu." };
        }

        // 1. Tạo một token reset an toàn
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 2. Hash token này trước khi lưu vào DB
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 3. Đặt thời gian hết hạn (ví dụ: 10 phút)
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        // 4. Tạo URL reset và gửi email
        // URL này nên trỏ đến trang "Đặt lại mật khẩu" trên frontend của bạn
        const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await mailService.sendMail({
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu Vietrobot',
            html: `
                <h1>Bạn đã yêu cầu đặt lại mật khẩu?</h1>
                <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu của bạn. Liên kết sẽ hết hạn sau 10 phút.</p>
                <a href="${resetURL}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
                <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
            `
        });

        return { message: "Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để đặt lại mật khẩu." };

    } catch (error) {
        // Không ném lỗi chi tiết ra ngoài, chỉ log lại để debug
        console.error("Forgot password service error:", error);
        throw new AppError(500, "Đã có lỗi xảy ra ở phía máy chủ");
    }
};

const resetPassword = async (token, newPassword) => {
    try {
        // 1. Hash token nhận được từ client để so sánh với DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // 2. Tìm user với token hợp lệ và chưa hết hạn
        const user = await User.unscoped().findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [require('sequelize').Op.gt]: Date.now() } // Token còn hạn
            }
        });

        if (!user) {
            throw new AppError(400, "Token không hợp lệ hoặc đã hết hạn.");
        }

        // 3. Đặt lại mật khẩu và xóa thông tin token
        user.password = newPassword; // Hook trong model sẽ tự động hash
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        return { message: "Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới." };

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Reset password service error:", error);
        throw new AppError(500, "Đã có lỗi xảy ra ở phía máy chủ");
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
};