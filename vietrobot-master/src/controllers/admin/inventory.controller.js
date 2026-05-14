// controllers/admin/inventory.controller.js
const inventoryService = require("../../services/inventory.service");
const { response } = require("../../helpers/response");

const getStockMovements = async (req, res, next) => {
    try {
        const filters = req.query; // { productId, type, startDate, endDate, etc. }
        const movements = await inventoryService.getStockMovements(filters);
        res.status(200).json(response(movements));
    } catch (error) {
        next(error);
    }
};

const createManualAdjustment = async (req, res, next) => {
    try {
        const { productId, quantity, notes } = req.body;
        const { id: userId } = req.user; // Lấy ID của nhân viên đang thực hiện
        
        const adjustmentData = {
            productId,
            quantity,
            notes,
            userId, // Ghi nhận ai là người điều chỉnh
        };

        const newMovement = await inventoryService.createAdjustment(adjustmentData);
        res.status(201).json(response(newMovement));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStockMovements,
    createManualAdjustment,
};