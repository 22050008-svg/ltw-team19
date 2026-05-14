// routers/v1/admin/dashboard.router.js
const express = require('express');
const dashboardController = require('../../../controllers/admin/dashboard.controller');
const { checkPermission } = require('../../../middlewares/permission.middleware');

// Path: /api/v1/admin/dashboard
const dashboardRouter = express.Router();

// GET /api/v1/admin/dashboard/overview
// Tổng quan: doanh thu, số đơn, số user, tồn kho
dashboardRouter.get('/overview', checkPermission('dashboard.read'), dashboardController.getOverviewStats);

// GET /api/v1/admin/dashboard/orders-by-status
// Đơn hàng theo trạng thái (dùng cho biểu đồ tròn)
dashboardRouter.get('/orders-by-status', checkPermission('dashboard.read'), dashboardController.getOrdersByStatus);

// GET /api/v1/admin/dashboard/daily-revenue?days=30
// Doanh thu theo ngày (dùng cho biểu đồ đường)
dashboardRouter.get('/daily-revenue', checkPermission('dashboard.read'), dashboardController.getDailyRevenue);

// GET /api/v1/admin/dashboard/staff
// Danh sách nhân viên và vai trò
dashboardRouter.get('/staff', checkPermission('dashboard.read'), dashboardController.getStaffList);

module.exports = dashboardRouter;
