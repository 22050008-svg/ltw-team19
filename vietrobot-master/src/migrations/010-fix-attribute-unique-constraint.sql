-- Migration: Fix ProductAttribute Unique Constraint
-- Purpose: Allow same attribute name for different categories
-- Allows: Thương Hiệu (common) + Thương Hiệu (Máy Lạnh) + Thương Hiệu (Máy Giặt)

-- Step 1: Xóa unique constraint trên name nếu tồn tại
ALTER TABLE product_attributes DROP INDEX IF EXISTS UK_product_attributes_name;

-- Step 2: Thêm composite unique constraint trên (name, category_id)
-- Cho phép cùng tên ở các danh mục khác nhau
ALTER TABLE product_attributes 
ADD CONSTRAINT UK_product_attributes_name_category 
UNIQUE KEY (name, category_id);

-- Verify: Kiểm tra constraint đã được tạo
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_NAME = 'product_attributes' AND COLUMN_NAME IN ('name', 'category_id');

-- Test case (nếu chạy thủ công):
-- INSERT INTO product_attributes (name, category_id, display_order) VALUES ('Thương Hiệu', NULL, 1);
-- INSERT INTO product_attributes (name, category_id, display_order) VALUES ('Thương Hiệu', 4, 1);  -- OK
-- INSERT INTO product_attributes (name, category_id, display_order) VALUES ('Thương Hiệu', 4, 2);  -- ERROR: Duplicate
