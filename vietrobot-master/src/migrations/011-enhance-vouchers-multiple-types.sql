-- Migration: 011-enhance-vouchers-multiple-types.sql
-- Purpose: Thêm hỗ trợ cho nhiều loại voucher
-- Date: 2026-03-09

-- Thêm các cột mới vào bảng vouchers
ALTER TABLE `vouchers` 
ADD COLUMN `voucher_type` ENUM('freeship', 'discount', 'brand', 'payment_method', 'category') 
    DEFAULT 'discount' COMMENT 'Loại voucher' AFTER `code`,
ADD COLUMN `min_order_value` DECIMAL(10,2) COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng freeship' AFTER `discount_value`,
ADD COLUMN `shipping_discount` DECIMAL(10,2) COMMENT 'Giá trị freeship (cố định hoặc phần trăm)' AFTER `min_order_value`,
ADD COLUMN `brand_id` INT COMMENT 'ID của thương hiệu áp dụng voucher' AFTER `shipping_discount`,
ADD COLUMN `category_id` INT COMMENT 'ID của loại sản phẩm áp dụng voucher' AFTER `brand_id`,
ADD COLUMN `payment_method` ENUM('VNPAY', 'QR', 'BANK_TRANSFER', 'COD') COMMENT 'Phương thức thanh toán áp dụng voucher' AFTER `category_id`,
ADD COLUMN `description` TEXT COMMENT 'Mô tả chi tiết về voucher' AFTER `usage_limit`,
ADD COLUMN `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái voucher' AFTER `description`;

-- Tạo index cho các cột tìm kiếm hay sử dụng
CREATE INDEX idx_voucher_type ON vouchers(voucher_type);
CREATE INDEX idx_brand_id ON vouchers(brand_id);
CREATE INDEX idx_category_id ON vouchers(category_id);
CREATE INDEX idx_is_active ON vouchers(is_active);
CREATE INDEX idx_expiry_date ON vouchers(expiry_date);

-- Thêm foreign key constraint cho brand_id (nếu có bảng brands)
-- ALTER TABLE `vouchers` 
-- ADD CONSTRAINT `fk_vouchers_brand` 
-- FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL;

-- Thêm foreign key constraint cho category_id
ALTER TABLE `vouchers` 
ADD CONSTRAINT `fk_vouchers_category` 
FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL;
