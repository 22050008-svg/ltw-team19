-- =====================================================================
-- Migration: Thêm permission dashboard.read
-- Chạy file này một lần trong MySQL để seed permission
-- =====================================================================

-- 1. Thêm permission dashboard.read
INSERT IGNORE INTO permissions (name, description, created_at, updated_at) VALUES
('dashboard.read', 'Xem dashboard quản lý', NOW(), NOW());

-- 2. Gán dashboard.read cho role super-admin
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super-admin'
  AND p.name = 'dashboard.read';

-- 3. (Tùy chọn) Gán thêm cho role manager nếu có
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
  AND p.name = 'dashboard.read';

-- 4. Kiểm tra kết quả
SELECT r.name AS role_name, p.name AS permission_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE p.name = 'dashboard.read';
