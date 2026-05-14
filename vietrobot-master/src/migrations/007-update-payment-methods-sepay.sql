-- Migration: Update Payment Methods - Replace 'sebay' with 'sepay'
-- Purpose: Update ENUM values in orders and payments tables to support Sepay (and remove old Sebay)
-- Date: 2026-04-16
-- Issue: Old code referenced 'sebay' but new Sepay implementation uses 'sepay'

USE shop;

-- Step 1: Update orders table payment_method ENUM
-- From: 'cod', 'vnpay', 'momo', 'sebay'
-- To: 'cod', 'vnpay', 'momo', 'sepay'
ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('cod', 'vnpay', 'momo', 'sepay') NOT NULL;

-- Step 2: Update payments table payment_method ENUM
-- From: 'cod', 'vnpay', 'momo', 'sebay'
-- To: 'cod', 'vnpay', 'momo', 'sepay'
ALTER TABLE payments 
MODIFY COLUMN payment_method ENUM('cod', 'vnpay', 'momo', 'sepay') NOT NULL;

-- Step 3: Update any existing records that have 'sebay' to 'sepay' (if any)
UPDATE orders SET payment_method = 'sepay' WHERE payment_method = 'sebay';
UPDATE payments SET payment_method = 'sepay' WHERE payment_method = 'sebay';

-- Step 4: Verify changes
DESCRIBE orders;
DESCRIBE payments;

-- Output:
-- - orders.payment_method ENUM should now be: 'cod', 'vnpay', 'momo', 'sepay'
-- - payments.payment_method ENUM should now be: 'cod', 'vnpay', 'momo', 'sepay'
-- - All 'sebay' records should be updated to 'sepay'
