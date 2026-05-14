-- =====================================================================
-- Migration 023: Xóa toàn bộ permissions khỏi role customer
-- Customer không cần permission vì các route customer không dùng checkPermission
-- Chạy file này một lần trong MySQL
-- =====================================================================

-- 1. Xóa toàn bộ role_permissions của role 'customer'
DELETE rp FROM role_permissions rp
INNER JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'customer';

-- 2. (Tùy chọn) Xóa luôn các permissions chỉ dành cho customer (không ai khác cần)
--    Bỏ comment nếu muốn xóa hẳn khỏi bảng permissions
-- DELETE FROM permissions
-- WHERE name IN (
--     'customer.read.own',
--     'customer.update.own',
--     'profile.update.own',
--     'order.read.own'
-- );

-- 3. Kiểm tra kết quả: customer phải trả về 0 permissions
SELECT r.name AS role_name, COUNT(rp.permission_id) AS permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;
