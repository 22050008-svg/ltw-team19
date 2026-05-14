-- Migration 009: Add required & isFilter flags to ProductAttribute
-- Ngày: 2026-03-04
-- Mục đích: Đánh dấu thuộc tính bắt buộc (required) và có thể filter (isFilter)

-- Thêm cột `required` - thuộc tính bắt buộc phải chọn
ALTER TABLE product_attributes 
ADD COLUMN `required` BOOLEAN DEFAULT 0 
AFTER `display_order`,
ADD COLUMN `is_filter` BOOLEAN DEFAULT 1 
AFTER `required`;

-- Đánh dấu "Thương Hiệu" (Brand) là thuộc tính bắt buộc cho tất cả danh mục
UPDATE product_attributes 
SET `required` = 1 
WHERE LOWER(name) = 'thương hiệu' OR LOWER(name) = 'brand';

-- Tất cả thuộc tính có thể dùng để filter (mặc định = 1)
-- Không cần update vì default là 1 rồi

COMMIT;
