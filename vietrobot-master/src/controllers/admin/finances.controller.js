// controllers/admin/finances.controller.js
const financeService = require("../../services/finances.service");
const { response } = require("../../helpers/response");

const getTransactions = async (req, res, next) => {
    try {
        const filters = req.query; // { startDate, endDate, type }
        const report = await financeService.getFinancialReport(filters);
        res.status(200).json(response(report));
    } catch (error) {
        next(error);
    }
};

const addManualTransaction = async (req, res, next) => {
    try {
        const { amount, type, description } = req.body;
        const { id: userId } = req.user; // Nhân viên ghi nhận giao dịch

        const transactionData = {
            amount,
            type,
            description,
            userId,
        };

        const newTransaction = await financeService.createManualTransaction(transactionData);
        res.status(201).json(response(newTransaction));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    addManualTransaction,
};