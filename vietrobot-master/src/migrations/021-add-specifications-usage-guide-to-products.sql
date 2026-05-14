-- Migration: Add specifications and usage_guide columns to products table
-- Date: March 2026
-- Purpose: Add missing columns that are defined in the Product model but missing from the database

ALTER TABLE products 
ADD COLUMN specifications JSON AFTER description,
ADD COLUMN usage_guide LONGTEXT AFTER specifications;

-- Set defaults for existing rows
UPDATE products SET specifications = NULL WHERE specifications IS NULL;
UPDATE products SET usage_guide = NULL WHERE usage_guide IS NULL;

-- Add comment to columns
ALTER TABLE products 
MODIFY specifications JSON COMMENT 'Thông số kỹ thuật - Array of {label, value} hoặc {section, items: [{label, value}]}',
MODIFY usage_guide LONGTEXT COMMENT 'Hướng dẫn sử dụng sản phẩm';
