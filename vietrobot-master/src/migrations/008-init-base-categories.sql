-- Initialize 4 Base Categories for Appliances
-- Run this AFTER migration 007-enhance-categories-ui.sql

INSERT INTO categories (id, name, description, icon, color, type, status, displayOrder, createdAt, updatedAt) VALUES
(1, 'Tủ Lạnh', 'Các sản phẩm tủ lạnh và tủ đông', '❄️', '#42a5f5', 'appliance', 'active', 1, NOW(), NOW()),
(2, 'Máy Giặt', 'Các sản phẩm máy giặt', '🔄', '#66bb6a', 'appliance', 'active', 2, NOW(), NOW()),
(3, 'Máy Sấy', 'Các sản phẩm máy sấy quần áo', '💨', '#ffb74d', 'appliance', 'active', 3, NOW(), NOW()),
(4, 'Máy Lạnh', 'Các sản phẩm máy lạnh', '❌', '#ef5350', 'appliance', 'active', 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  icon = VALUES(icon),
  color = VALUES(color),
  status = 'active',
  displayOrder = VALUES(displayOrder);

-- Verify
SELECT id, name, icon, color, type, status, displayOrder FROM categories ORDER BY displayOrder;
