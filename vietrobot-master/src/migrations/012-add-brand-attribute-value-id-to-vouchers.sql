-- Migration 012: Add brand_attribute_value_id to vouchers table
-- Purpose: Store brand attribute value ID for vouchers to access full brand data

ALTER TABLE vouchers ADD COLUMN brand_attribute_value_id INT AFTER brand_id;

-- Add foreign key constraint to product_attribute_values
ALTER TABLE vouchers ADD CONSTRAINT fk_vouchers_brand_attr_value 
  FOREIGN KEY (brand_attribute_value_id) 
  REFERENCES product_attribute_values(id) 
  ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_brand_attribute_value_id ON vouchers(brand_attribute_value_id);

-- Update existing vouchers with brand_id to use brand_attribute_value_id
-- This query assumes you have a way to map old brand_id to attribute value
-- If brand_id was actually the attribute value id, you can uncomment:
-- UPDATE vouchers SET brand_attribute_value_id = brand_id WHERE brand_id IS NOT NULL AND voucherType = 'brand';
