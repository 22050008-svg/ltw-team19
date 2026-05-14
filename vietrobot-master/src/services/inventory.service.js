// services/admin/inventory.service.js
const { Op } = require("sequelize");
const { sequelize, StockMovement, Product, User } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Lấy lịch sử xuất/nhập kho với các bộ lọc và phân trang.
 * @param {object} queryParams - Các tham số truy vấn từ controller.
 * @returns {Promise<object>} Đối tượng chứa dữ liệu và thông tin phân trang.
 */
const getStockMovements = async (queryParams) => {
    try {
        const { page = 1, limit = 10, productId, type, userId, startDate, endDate } = queryParams;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (productId) {
            whereClause.productId = productId;
        }
        if (type) {
            whereClause.type = type;
        }
        if (userId) {
            whereClause.userId = userId;
        }
        if (startDate && endDate) {
            whereClause.timestamp = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const { count, rows } = await StockMovement.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Product,
                    as: 'product', // Alias định nghĩa trong model
                    attributes: ['id', 'name', 'sku'] // Chỉ lấy các trường cần thiết
                },
                {
                    model: User,
                    as: 'staff', // Alias định nghĩa trong model
                    attributes: ['id', 'fullName', 'email'] // Loại bỏ password và các trường nhạy cảm
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['timestamp', 'DESC']] // Sắp xếp theo thời gian mới nhất
        });

        return {
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };

    } catch (error) {
        console.error("Error in getStockMovements service: ", error);
        throw new AppError(500, "Failed to retrieve stock movements");
    }
};

/**
 * Tạo một phiếu điều chỉnh kho thủ công và cập nhật số lượng tồn kho của sản phẩm.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param {object} adjustmentData - Dữ liệu của phiếu điều chỉnh.
 * @param {number} adjustmentData.productId - ID sản phẩm.
 * @param {number} adjustmentData.quantity - Số lượng thay đổi (dương: nhập, âm: xuất).
 * @param {string} adjustmentData.notes - Ghi chú.
 * @param {number} adjustmentData.userId - ID nhân viên thực hiện.
 * @returns {Promise<StockMovement>} Đối tượng StockMovement vừa được tạo.
 */
const createAdjustment = async (adjustmentData) => {
    const t = await sequelize.transaction();
    try {
        const { productId, quantity, notes, userId } = adjustmentData;

        // --- Validate Inputs ---
        if (!quantity || quantity === 0) {
            throw new AppError(400, "Adjustment quantity cannot be zero");
        }

        // --- Perform Operations within Transaction ---
        // 1. Tìm sản phẩm và khóa dòng đó lại để tránh race condition
        const product = await Product.findByPk(productId, {
            transaction: t,
            lock: t.LOCK.UPDATE // Ngăn chặn các transaction khác cập nhật dòng này cho đến khi transaction hiện tại hoàn tất
        });

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        // 2. Tạo một bản ghi lịch sử kho mới
        const newMovement = await StockMovement.create({
            productId,
            quantity, // Giữ nguyên dấu (dương hoặc âm)
            type: 'adjustment',
            notes,
            userId,
        }, { transaction: t });

        // 3. Cập nhật số lượng tồn kho của sản phẩm
        // Sử dụng increment để tăng (hoặc giảm nếu quantity là số âm) một cách an toàn
        await product.increment('stockQuantity', {
            by: quantity,
            transaction: t
        });

        // --- Commit Transaction ---
        // Nếu tất cả các bước trên thành công, lưu các thay đổi vào DB
        await t.commit();

        return newMovement;

    } catch (error) {
        // --- Rollback Transaction ---
        // Nếu có bất kỳ lỗi nào xảy ra, hủy bỏ tất cả các thay đổi
        await t.rollback();
        
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in createAdjustment service: ", error);
        throw new AppError(500, "Failed to create inventory adjustment");
    }
};


module.exports = {
    getStockMovements,
    createAdjustment,
};