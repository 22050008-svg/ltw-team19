// services/admin/vouchers.service.js
<<<<<<< HEAD
const { Op } = require("sequelize");
=======
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
const { Voucher } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Lấy danh sách tất cả các mã giảm giá.
 * @returns {Promise<Voucher[]>} Một mảng các đối tượng voucher.
 */
const getVouchers = async () => {
    try {
        const vouchers = await Voucher.findAll({
<<<<<<< HEAD
            order: [['createdAt', 'DESC']],
=======
            order: [['createdAt', 'DESC']], // Sắp xếp theo mã mới nhất
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
        });
        return vouchers;
    } catch (error) {
        console.error("Error in getVouchers service: ", error);
        throw new AppError(500, "Không thể lấy danh sách voucher");
    }
};

/**
 * Tạo một mã giảm giá mới.
 * @param {object} voucherData - Dữ liệu của mã giảm giá mới.
 * @returns {Promise<Voucher>} Đối tượng voucher vừa được tạo.
 */
const createVoucher = async (voucherData) => {
    try {
        const { 
            code, 
            voucherType = 'discount', 
            discountType, 
            discountValue, 
            expiryDate, 
            usageLimit, 
            minOrderValue, 
            shippingDiscount, 
            brandId, 
            brandAttributeValueId,
            categoryId, 
            paymentMethod 
        } = voucherData;

        // --- Validation ---
        // 1. Kiểm tra xem mã đã tồn tại chưa
        const existingVoucher = await Voucher.findOne({ where: { code } });
        if (existingVoucher) {
            throw new AppError(400, "Mã voucher đã tồn tại");
        }

        // 2. Kiểm tra ngày hết hạn
        if (new Date(expiryDate) < new Date()) {
            throw new AppError(400, "Ngày hết hạn phải trong tương lai");
        }
        
        // 3. Kiểm tra giới hạn sử dụng
        if (usageLimit <= 0) {
            throw new AppError(400, "Giới hạn sử dụng phải > 0");
        }

        // 4. Validation dựa trên loại voucher
        switch (voucherType) {
            case 'discount':
                // Giảm giá trực tiếp - yêu cầu discountType và discountValue
                if (!discountType || !discountValue) {
                    throw new AppError(400, "Loại giảm và giá trị giảm là bắt buộc");
                }
                if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                    throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                }
                if (discountType === 'fixed_amount' && discountValue <= 0) {
                    throw new AppError(400, "Giá trị tiền phải > 0");
                }
                break;

            case 'freeship':
                // Freeship - yêu cầu minOrderValue và shippingDiscount
                if (!minOrderValue || minOrderValue <= 0) {
                    throw new AppError(400, "Giá trị đơn hàng tối thiểu là bắt buộc và phải > 0");
                }
                if (!shippingDiscount || shippingDiscount <= 0) {
                    throw new AppError(400, "Mức freeship là bắt buộc và phải > 0");
                }
                break;

            case 'brand':
                // Voucher từ thương hiệu - yêu cầu brandAttributeValueId (hoặc brandId for backward compatibility)
                const brandValueId = brandAttributeValueId || brandId;
                if (!brandValueId) {
                    throw new AppError(400, "ID thương hiệu là bắt buộc");
                }
                if (!discountType || !discountValue) {
                    throw new AppError(400, "Loại giảm và giá trị giảm là bắt buộc");
                }
                if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                    throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                }
                if (discountType === 'fixed_amount' && discountValue <= 0) {
                    throw new AppError(400, "Giá trị tiền phải > 0");
                }
                break;

            case 'category':
                // Voucher từ loại sản phẩm - yêu cầu categoryId, discountType và discountValue
                if (!categoryId) {
                    throw new AppError(400, "ID loại sản phẩm là bắt buộc");
                }
                if (!discountType || !discountValue) {
                    throw new AppError(400, "Loại giảm và giá trị giảm là bắt buộc");
                }
                if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                    throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                }
                if (discountType === 'fixed_amount' && discountValue <= 0) {
                    throw new AppError(400, "Giá trị tiền phải > 0");
                }
                break;

            case 'payment_method':
                // Voucher cho phương thức thanh toán - yêu cầu paymentMethod, discountType và discountValue
                if (!paymentMethod) {
                    throw new AppError(400, "Phương thức thanh toán là bắt buộc");
                }
                if (!['VNPAY', 'QR', 'BANK_TRANSFER', 'COD'].includes(paymentMethod)) {
                    throw new AppError(400, "Phương thức thanh toán không hợp lệ");
                }
                if (!discountType || !discountValue) {
                    throw new AppError(400, "Loại giảm và giá trị giảm là bắt buộc");
                }
                if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                    throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                }
                if (discountType === 'fixed_amount' && discountValue <= 0) {
                    throw new AppError(400, "Giá trị tiền phải > 0");
                }
                break;

            default:
                throw new AppError(400, "Loại voucher không hợp lệ");
        }

        // --- Creation ---
        const newVoucher = await Voucher.create(voucherData);
        return newVoucher;

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in createVoucher service: ", error);
        console.error("Full error details: ", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            sql: error.sql,
            original: error.original?.message
        });
        throw new AppError(500, "Không thể tạo mã voucher: " + (error.message || error.original?.message || "Lỗi không xác định"));
    }
};

/**
 * Cập nhật thông tin của một mã giảm giá.
 * @param {number} voucherId - ID của voucher cần cập nhật.
 * @param {object} updateData - Dữ liệu cần cập nhật.
 * @returns {Promise<Voucher>} Đối tượng voucher sau khi đã cập nhật.
 */
const updateVoucher = async (voucherId, updateData) => {
    try {
        // 1. Tìm voucher cần cập nhật
        const voucher = await Voucher.findByPk(voucherId);
        if (!voucher) {
            throw new AppError(404, "Không tìm thấy voucher");
        }

        // 2. Validate dữ liệu cập nhật nếu có
        if (updateData.expiryDate && new Date(updateData.expiryDate) < new Date()) {
            throw new AppError(400, "Ngày hết hạn phải trong tương lai");
        }
        if (updateData.usageLimit && updateData.usageLimit < voucher.usageCount) {
            throw new AppError(400, "Giới hạn sử dụng không thể nhỏ hơn lượt sử dụng hiện tại");
        }

        // 3. Validate theo loại voucher nếu cập nhật dữ liệu loại
        const voucherType = updateData.voucherType || voucher.voucherType;
        const { discountType, discountValue, minOrderValue, shippingDiscount, brandId, categoryId, paymentMethod } = updateData;

        switch (voucherType) {
            case 'discount':
                if (discountType && discountValue) {
                    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                        throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                    }
                    if (discountType === 'fixed_amount' && discountValue <= 0) {
                        throw new AppError(400, "Giá trị tiền phải > 0");
                    }
                }
                break;

            case 'freeship':
                if (minOrderValue && minOrderValue <= 0) {
                    throw new AppError(400, "Giá trị đơn hàng tối thiểu phải > 0");
                }
                if (shippingDiscount && shippingDiscount <= 0) {
                    throw new AppError(400, "Mức freeship phải > 0");
                }
                break;

            case 'brand':
                if (discountType && discountValue) {
                    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                        throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                    }
                    if (discountType === 'fixed_amount' && discountValue <= 0) {
                        throw new AppError(400, "Giá trị tiền phải > 0");
                    }
                }
                break;

            case 'category':
                if (discountType && discountValue) {
                    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                        throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                    }
                    if (discountType === 'fixed_amount' && discountValue <= 0) {
                        throw new AppError(400, "Giá trị tiền phải > 0");
                    }
                }
                break;

            case 'payment_method':
                if (paymentMethod && !['VNPAY', 'QR', 'BANK_TRANSFER', 'COD'].includes(paymentMethod)) {
                    throw new AppError(400, "Phương thức thanh toán không hợp lệ");
                }
                if (discountType && discountValue) {
                    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                        throw new AppError(400, "Phần trăm phải từ 1 đến 100");
                    }
                    if (discountType === 'fixed_amount' && discountValue <= 0) {
                        throw new AppError(400, "Giá trị tiền phải > 0");
                    }
                }
                break;
        }

        // 4. Thực hiện cập nhật
        const updatedVoucher = await voucher.update(updateData);
        return updatedVoucher;

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in updateVoucher service: ", error);
        throw new AppError(500, "Không thể cập nhật voucher");
    }
};

/**
 * Xóa một mã giảm giá.
 * @param {number} voucherId - ID của voucher cần xóa.
 * @returns {Promise<void>}
 */
const deleteVoucher = async (voucherId) => {
    try {
        // 1. Tìm voucher cần xóa
        const voucher = await Voucher.findByPk(voucherId);
        if (!voucher) {
            throw new AppError(404, "Không tìm thấy voucher");
        }

        // 2. Thực hiện xóa
        await voucher.destroy();
        
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in deleteVoucher service: ", error);
        throw new AppError(500, "Không thể xóa voucher");
    }
};

module.exports = {
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
};