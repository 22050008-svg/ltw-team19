import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Card, Statistic, Table, Tag, Spin, message, Select, Typography
} from 'antd';
import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import DashboardService from '../../../Services/adminservice/DashboardService';

const { Title } = Typography;
const { Option } = Select;

// Màu sắc cho biểu đồ tròn theo trạng thái đơn hàng
const STATUS_COLORS = {
    pending: '#faad14',
    processing: '#1677ff',
    shipped: '#722ed1',
    delivered: '#52c41a',
    cancelled: '#ff4d4f',
    failed: '#8c8c8c',
    awaiting_payment: '#13c2c2',
};

const STATUS_LABELS = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    failed: 'Thất bại',
    awaiting_payment: 'Chờ thanh toán',
};

// Format tiền VND
const formatVND = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// Custom tooltip cho LineChart
const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', padding: '10px', borderRadius: 6 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                <p style={{ margin: 0, color: '#1677ff' }}>
                    Doanh thu: {formatVND(payload[0]?.value || 0)}
                </p>
                <p style={{ margin: 0, color: '#52c41a' }}>
                    Số đơn: {payload[1]?.value || 0}
                </p>
            </div>
        );
    }
    return null;
};

const DashboardTab = () => {
    const [overview, setOverview] = useState(null);
    const [ordersByStatus, setOrdersByStatus] = useState([]);
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [days, setDays] = useState(30);

    const fetchOverview = useCallback(async () => {
        setLoadingOverview(true);
        try {
            const res = await DashboardService.getOverviewStats();
            setOverview(res.data.data);
        } catch {
            message.error('Không thể tải thống kê tổng quan');
        } finally {
            setLoadingOverview(false);
        }
    }, []);

    const fetchCharts = useCallback(async (numDays) => {
        setLoadingCharts(true);
        try {
            const [statusRes, revenueRes] = await Promise.all([
                DashboardService.getOrdersByStatus(),
                DashboardService.getDailyRevenue(numDays),
            ]);
            setOrdersByStatus(statusRes.data.data || []);
            setDailyRevenue(revenueRes.data.data || []);
        } catch {
            message.error('Không thể tải dữ liệu biểu đồ');
        } finally {
            setLoadingCharts(false);
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        setLoadingStaff(true);
        try {
            const res = await DashboardService.getStaffList();
            setStaffList(res.data.data || []);
        } catch {
            message.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoadingStaff(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
        fetchStaff();
    }, [fetchOverview, fetchStaff]);

    useEffect(() => {
        fetchCharts(days);
    }, [fetchCharts, days]);

    // Cột bảng nhân viên
    const staffColumns = [
        {
            title: 'Tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (v) => v || '—',
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) =>
                roles?.map((r) => (
                    <Tag color="blue" key={r.id}>
                        {r.name}
                    </Tag>
                )),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v) => new Date(v).toLocaleDateString('vi-VN'),
        },
    ];

    return (
        <div style={{ padding: '8px 0' }}>
            <Title level={4} style={{ marginBottom: 20 }}>Tổng quan hệ thống</Title>

            {/* ── STAT CARDS ── */}
            <Spin spinning={loadingOverview}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ background: '#e6f4ff' }}>
                            <Statistic
                                title="Tổng doanh thu"
                                value={overview?.totalRevenue || 0}
                                formatter={(v) => formatVND(v)}
                                prefix={<DollarCircleOutlined style={{ color: '#1677ff' }} />}
                                valueStyle={{ color: '#1677ff', fontSize: 20 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ background: '#f6ffed' }}>
                            <Statistic
                                title="Tổng đơn hàng"
                                value={overview?.totalOrders || 0}
                                prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a', fontSize: 20 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ background: '#fff7e6' }}>
                            <Statistic
                                title="Tổng người dùng"
                                value={overview?.totalUsers || 0}
                                prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ background: '#fff0f6' }}>
                            <Statistic
                                title="Tồn kho"
                                value={overview?.totalInventory || 0}
                                suffix="sản phẩm"
                                prefix={<InboxOutlined style={{ color: '#eb2f96' }} />}
                                valueStyle={{ color: '#eb2f96', fontSize: 20 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>

            {/* ── CHARTS ── */}
            <Spin spinning={loadingCharts}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {/* Biểu đồ đường: Doanh thu theo ngày */}
                    <Col xs={24} lg={15}>
                        <Card
                            title="Doanh thu theo ngày"
                            extra={
                                <Select value={days} onChange={setDays} size="small" style={{ width: 110 }}>
                                    <Option value={7}>7 ngày</Option>
                                    <Option value={30}>30 ngày</Option>
                                    <Option value={90}>90 ngày</Option>
                                </Select>
                            }
                            bordered={false}
                        >
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis
                                        yAxisId="left"
                                        tickFormatter={(v) =>
                                            v >= 1_000_000
                                                ? `${(v / 1_000_000).toFixed(1)}M`
                                                : `${(v / 1000).toFixed(0)}K`
                                        }
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                    <Tooltip content={<RevenueTooltip />} />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#1677ff"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Doanh thu"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#52c41a"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Số đơn"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    {/* Biểu đồ tròn: Đơn hàng theo trạng thái */}
                    <Col xs={24} lg={9}>
                        <Card title="Đơn hàng theo trạng thái" bordered={false} style={{ height: '100%' }}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={ordersByStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={85}
                                        label={({ status, percent }) =>
                                            `${STATUS_LABELS[status] || status} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {ordersByStatus.map((entry) => (
                                            <Cell
                                                key={entry.status}
                                                fill={STATUS_COLORS[entry.status] || '#8884d8'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, STATUS_LABELS[name] || name]}
                                    />
                                    <Legend
                                        formatter={(value) => STATUS_LABELS[value] || value}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </Spin>

            {/* ── STAFF TABLE ── */}
            <Card title="Danh sách nhân viên" bordered={false}>
                <Table
                    dataSource={staffList}
                    columns={staffColumns}
                    rowKey="id"
                    loading={loadingStaff}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default DashboardTab;
