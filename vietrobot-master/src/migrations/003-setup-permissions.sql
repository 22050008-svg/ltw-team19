-- =====================================================================
-- Setup Permissions for E-commerce System
-- Tạo danh sách các quyền hạn cho hệ thống
-- =====================================================================

-- Delete existing permissions (nếu cần reset)
-- DELETE FROM permissions;

-- =====================================================================
-- SYSTEM MANAGEMENT PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('system.manage.roles', 'Quản lý roles', NOW(), NOW()),
('system.manage.permissions', 'Quản lý permissions', NOW(), NOW()),
('system.manage.settings', 'Quản lý cài đặt hệ thống', NOW(), NOW()),
('system.manage.users', 'Quản lý toàn bộ users', NOW(), NOW()),
('system.view.logs', 'Xem logs hệ thống', NOW(), NOW());

-- =====================================================================
-- PRODUCT MANAGEMENT PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('product.create', 'Tạo sản phẩm mới', NOW(), NOW()),
('product.read', 'Xem danh sách sản phẩm', NOW(), NOW()),
('product.update', 'Cập nhật thông tin sản phẩm', NOW(), NOW()),
('product.delete', 'Xóa sản phẩm', NOW(), NOW()),
('product.publish', 'Xuất bản/Ẩn sản phẩm', NOW(), NOW()),
('product.analytics', 'Xem phân tích sản phẩm', NOW(), NOW()),
('category.read', 'Xem danh mục sản phẩm', NOW(), NOW()),
('category.create', 'Tạo danh mục sản phẩm', NOW(), NOW()),
('category.update', 'Cập nhật danh mục', NOW(), NOW()),
('category.manage', 'Quản lý hoàn toàn danh mục', NOW(), NOW());

-- =====================================================================
-- ORDER MANAGEMENT PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('order.create', 'Tạo đơn hàng', NOW(), NOW()),
('order.read', 'Xem danh sách đơn hàng', NOW(), NOW()),
('order.read.own', 'Xem đơn hàng của riêng mình', NOW(), NOW()),
('order.update', 'Cập nhật đơn hàng', NOW(), NOW()),
('order.delete', 'Xóa đơn hàng', NOW(), NOW()),
('order.approve', 'Phê duyệt đơn hàng', NOW(), NOW()),
('order.cancel', 'Hủy đơn hàng', NOW(), NOW()),
('order.export', 'Xuất báo cáo đơn hàng', NOW(), NOW());

-- =====================================================================
-- INVENTORY & WAREHOUSE PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('inventory.read', 'Xem hàng tồn kho', NOW(), NOW()),
('inventory.update', 'Cập nhật hàng tồn kho', NOW(), NOW()),
('inventory.manage', 'Quản lý hoàn toàn kho', NOW(), NOW()),
('shipping.read', 'Xem thông tin vận chuyển', NOW(), NOW()),
('shipping.manage', 'Quản lý vận chuyển', NOW(), NOW()),
('report.inventory', 'Báo cáo hàng tồn kho', NOW(), NOW());

-- =====================================================================
-- CUSTOMER MANAGEMENT PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('user.create', 'Tạo user mới', NOW(), NOW()),
('user.read', 'Xem danh sách users', NOW(), NOW()),
('user.update', 'Cập nhật thông tin user', NOW(), NOW()),
('user.delete', 'Xóa user', NOW(), NOW()),
('user.manage.staff', 'Quản lý nhân viên', NOW(), NOW()),
('customer.read', 'Xem thông tin khách hàng', NOW(), NOW()),
('customer.update', 'Cập nhật thông tin khách hàng', NOW(), NOW()),
('customer.view', 'Xem hồ sơ khách hàng', NOW(), NOW()),
('customer.read.own', 'Xem hồ sơ của riêng mình', NOW(), NOW()),
('customer.update.own', 'Cập nhật hồ sơ của riêng mình', NOW(), NOW()),
('profile.update.own', 'Cập nhật profile cá nhân', NOW(), NOW());

-- =====================================================================
-- PAYMENT & FINANCE PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('payment.read', 'Xem thông tin thanh toán', NOW(), NOW()),
('payment.manage', 'Quản lý thanh toán', NOW(), NOW()),
('invoice.read', 'Xem hóa đơn', NOW(), NOW()),
('invoice.manage', 'Quản lý hóa đơn', NOW(), NOW()),
('invoice.export', 'Xuất hóa đơn', NOW(), NOW()),
('refund.read', 'Xem thông tin hoàn tiền', NOW(), NOW()),
('refund.manage', 'Quản lý hoàn tiền', NOW(), NOW()),
('refund.approve', 'Phê duyệt hoàn tiền', NOW(), NOW()),
('revenue.read', 'Xem doanh thu', NOW(), NOW()),
('revenue.view', 'Thống kê doanh thu', NOW(), NOW());

-- =====================================================================
-- MARKETING & PROMOTION PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('promotion.create', 'Tạo khuyến mại', NOW(), NOW()),
('promotion.read', 'Xem khuyến mại', NOW(), NOW()),
('promotion.update', 'Cập nhật khuyến mại', NOW(), NOW()),
('promotion.delete', 'Xóa khuyến mại', NOW(), NOW()),
('promotion.manage', 'Quản lý khuyến mại', NOW(), NOW()),
('newsletter.manage', 'Quản lý newsletter', NOW(), NOW()),
('banner.manage', 'Quản lý banner', NOW(), NOW()),
('blog.manage', 'Quản lý blog', NOW(), NOW()),
('analytics.read', 'Xem phân tích', NOW(), NOW()),
('analytics.view', 'Thống kê phân tích', NOW(), NOW()),
('report.marketing', 'Báo cáo marketing', NOW(), NOW());

-- =====================================================================
-- SUPPORT & TICKETING PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('ticket.read', 'Xem support tickets', NOW(), NOW()),
('ticket.update', 'Cập nhật tickets', NOW(), NOW()),
('ticket.manage', 'Quản lý tickets', NOW(), NOW());

-- =====================================================================
-- REPORTING & ANALYTICS PERMISSIONS
-- =====================================================================
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('report.view', 'Xem báo cáo', NOW(), NOW()),
('report.financial', 'Báo cáo tài chính', NOW(), NOW()),
('report.export', 'Xuất báo cáo', NOW(), NOW());

-- =====================================================================
-- Confirmation
-- =====================================================================
SELECT COUNT(*) as 'Total Permissions Created' FROM permissions;
