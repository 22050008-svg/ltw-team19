import api from '../../api/axiosConfig';

const DashboardService = {
    getOverviewStats: () => api.get('/admin/dashboard/overview'),
    getOrdersByStatus: () => api.get('/admin/dashboard/orders-by-status'),
    getDailyRevenue: (days = 30) => api.get(`/admin/dashboard/daily-revenue?days=${days}`),
    getStaffList: () => api.get('/admin/dashboard/staff'),
};

export default DashboardService;
