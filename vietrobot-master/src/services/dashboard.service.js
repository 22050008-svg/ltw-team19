// services/dashboard.service.js
const { Op, fn, col } = require('sequelize');
const { Order, User, ProductVariant, Role, sequelize } = require('../models');

/**
 * Thống kê tổng quan: doanh thu, số đơn, số user, tổng tồn kho
 */
const getOverviewStats = async () => {
    const [revenueResult, orderCount, userCount, inventoryResult] = await Promise.all([
        // Tổng doanh thu từ đơn đã giao thành công
        Order.findOne({
            attributes: [[fn('SUM', col('total_amount')), 'totalRevenue']],
            where: { status: 'delivered' },
            raw: true,
        }),
        // Tổng số đơn hàng (tất cả trạng thái)
        Order.count(),
        // Tổng số user
        User.count(),
        // Tổng tồn kho
        ProductVariant.findOne({
            attributes: [[fn('SUM', col('stock_quantity')), 'totalStock']],
            raw: true,
        }),
    ]);

    return {
        totalRevenue: parseFloat(revenueResult?.totalRevenue) || 0,
        totalOrders: orderCount || 0,
        totalUsers: userCount || 0,
        totalInventory: parseInt(inventoryResult?.totalStock) || 0,
    };
};

/**
 * Số đơn hàng theo từng trạng thái
 */
const getOrdersByStatus = async () => {
    const results = await Order.findAll({
        attributes: [
            'status',
            [fn('COUNT', col('id')), 'count'],
        ],
        group: ['status'],
        raw: true,
    });

    return results.map(r => ({
        status: r.status,
        count: parseInt(r.count),
    }));
};

/**
 * Doanh thu theo ngày trong N ngày gần nhất
 * @param {number} days - Số ngày muốn xem (mặc định 30)
 */
const getDailyRevenue = async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const results = await Order.findAll({
        attributes: [
            [fn('DATE', col('Order.createdAt')), 'date'],
            [fn('SUM', col('Order.total_amount')), 'revenue'],
            [fn('COUNT', col('Order.id')), 'count'],
        ],
        where: {
            status: 'delivered',
            createdAt: { [Op.gte]: startDate },
        },
        group: [fn('DATE', col('Order.createdAt'))],
        order: [[fn('DATE', col('Order.createdAt')), 'ASC']],
        raw: true,
    });

    return results.map(r => ({
        date: r.date,
        revenue: parseFloat(r.revenue) || 0,
        count: parseInt(r.count) || 0,
    }));
};

/**
 * Danh sách nhân viên (users có role không phải 'customer')
 */
const getStaffList = async () => {
    // Lấy tất cả users kèm roles, sau đó filter ở app layer
    // để tránh lỗi logic với users có nhiều role (JOIN tạo nhiều row)
    const allUsers = await User.findAll({
        attributes: ['id', 'fullName', 'email', 'phone', 'createdAt'],
        include: [{
            model: Role,
            as: 'roles',
            attributes: ['id', 'name', 'description'],
            through: { attributes: [] },
        }],
    });

    // Chỉ giữ lại users có ít nhất 1 role KHÔNG PHẢI 'customer'
    const staffUsers = allUsers.filter(u =>
        u.roles.some(r => r.name !== 'customer')
    );

    return staffUsers.map(u => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        roles: u.roles.map(r => ({ id: r.id, name: r.name, description: r.description })),
    }));
};

module.exports = {
    getOverviewStats,
    getOrdersByStatus,
    getDailyRevenue,
    getStaffList,
};
