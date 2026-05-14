// controllers/admin/dashboard.controller.js
const dashboardService = require('../../services/dashboard.service');
const { response } = require('../../helpers/response');

const getOverviewStats = async (req, res, next) => {
    try {
        const data = await dashboardService.getOverviewStats();
        res.status(200).json(response(data));
    } catch (error) {
        next(error);
    }
};

const getOrdersByStatus = async (req, res, next) => {
    try {
        const data = await dashboardService.getOrdersByStatus();
        res.status(200).json(response(data));
    } catch (error) {
        next(error);
    }
};

const getDailyRevenue = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await dashboardService.getDailyRevenue(days);
        res.status(200).json(response(data));
    } catch (error) {
        next(error);
    }
};

const getStaffList = async (req, res, next) => {
    try {
        const data = await dashboardService.getStaffList();
        res.status(200).json(response(data));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOverviewStats,
    getOrdersByStatus,
    getDailyRevenue,
    getStaffList,
};
