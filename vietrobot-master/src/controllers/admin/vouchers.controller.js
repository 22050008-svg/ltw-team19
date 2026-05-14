// controllers/admin/vouchers.controller.js
const voucherService = require("../../services/vouchers.service");
const { response } = require("../../helpers/response");

const getVouchers = async (req, res, next) => {
    try {
        const vouchers = await voucherService.getVouchers();
        res.status(200).json(response(vouchers));
    } catch (error) {
        next(error);
    }
};

const createVoucher = async (req, res, next) => {
    try {
        const voucherData = req.body; // { code, discountType, discountValue, expiryDate, usageLimit }
        const newVoucher = await voucherService.createVoucher(voucherData);
        res.status(201).json(response(newVoucher));
    } catch (error) {
        next(error);
    }
};

const updateVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // { expiryDate, usageLimit, etc. }
        const updatedVoucher = await voucherService.updateVoucher(id, updateData);
        res.status(200).json(response(updatedVoucher));
    } catch (error) {
        next(error);
    }
};

const deleteVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        await voucherService.deleteVoucher(id);
        res.status(204).send(); // No Content
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
};