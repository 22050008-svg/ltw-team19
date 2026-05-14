-- Migration: Add UI Enhancement Fields to Categories

ALTER TABLE categories 
ADD COLUMN icon VARCHAR(100) COMMENT 'Icon name or emoji',
ADD COLUMN color VARCHAR(50) COMMENT 'Hex color or color name',
ADD COLUMN image VARCHAR(255) COMMENT 'Image URL for category',
ADD COLUMN displayOrder INT DEFAULT 0 COMMENT 'Sort order',
ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active',
ADD COLUMN type ENUM('appliance', 'electronics', 'other') DEFAULT 'other' COMMENT 'Category type';

-- Create Index for faster queries
CREATE INDEX idx_category_status ON categories(status);
CREATE INDEX idx_category_displayOrder ON categories(displayOrder);
CREATE INDEX idx_category_type ON categories(type);

-- Update existing categories with default values for appliances
-- Tủ Lạnh (Refrigerator)
UPDATE categories SET icon = '❄️', color = '#1890ff', displayOrder = 1, type = 'appliance' 
WHERE name = 'Tủ Lạnh' LIMIT 1;

-- Máy Giặt (Washing Machine)
UPDATE categories SET icon = '🔄', color = '#52c41a', displayOrder = 2, type = 'appliance' 
WHERE name = 'Máy Giặt' LIMIT 1;

-- Máy Sấy (Dryer)
UPDATE categories SET icon = '💨', color = '#faad14', displayOrder = 3, type = 'appliance' 
WHERE name = 'Máy Sấy' LIMIT 1;

-- Máy Lạnh (Air Conditioner)
UPDATE categories SET icon = '❌', color = '#eb2f96', displayOrder = 4, type = 'appliance' 
WHERE name = 'Máy Lạnh' LIMIT 1;
