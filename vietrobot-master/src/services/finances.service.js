// services/admin/finances.service.js
const { Op } = require("sequelize");
const { sequelize, Transaction, Order, User } = require("../models");
const { AppError } = require("../helpers/error");

/**
 * Lấy báo cáo tài chính bao gồm danh sách giao dịch và bảng tóm tắt.
 * @param {object} queryParams - Các tham số truy vấn (page, limit, type, startDate, etc.).
 * @returns {Promise<object>} Đối tượng chứa báo cáo tài chính.
 */
const getFinancialReport = async (queryParams) => {
    try {
        const { page = 1, limit = 10, type, startDate, endDate } = queryParams;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        // Lấy danh sách giao dịch có phân trang
        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            include: [
                { model: Order, as: 'order', attributes: ['id'] },
                { model: User, as: 'staff', attributes: ['id', 'fullName'] }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['date', 'DESC']]
        });

        // Tính toán bảng tóm tắt dựa trên cùng bộ lọc
        const summaryPromises = [
            Transaction.sum('amount', { where: { ...whereClause, type: 'income' } }),
            Transaction.sum('amount', { where: { ...whereClause, type: 'expense' } })
        ];

        const [totalIncome, totalExpense] = await Promise.all(summaryPromises);

        const summary = {
            totalIncome: totalIncome || 0,
            totalExpense: totalExpense || 0,
            netProfit: (totalIncome || 0) - (totalExpense || 0)
        };
        
        return {
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
            summary: summary
        };

    } catch (error) {
        console.error("Error in getFinancialReport service: ", error);
        throw new AppError(500, "Failed to generate financial report");
    }
};

/**
 * Tạo một giao dịch tài chính thủ công (ví dụ: chi phí thuê nhà, lương).
 * @param {object} transactionData - Dữ liệu giao dịch.
 * @returns {Promise<Transaction>} Đối tượng giao dịch vừa được tạo.
 */
const createManualTransaction = async (transactionData) => {
    try {
        const { amount, type, description, userId } = transactionData;
        if (!amount || !type || !description) {
            throw new AppError(400, "Amount, type, and description are required");
        }

        const newTransaction = await Transaction.create({
            amount,
            type,
            description,
            userId, // Ghi nhận nhân viên nào đã tạo giao dịch này
            date: new Date(),
        });

        return newTransaction;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error in createManualTransaction service: ", error);
        throw new AppError(500, "Failed to create manual transaction");
    }
};


module.exports = {
    getFinancialReport,
    createManualTransaction,
};