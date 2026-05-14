-- Migration: Add VNPay Support and Payment Methods
-- Purpose: Update Payment table to support QR code, payment URLs, and new payment methods (COD, VNPay)
-- Date: 2026-03-03

USE shop;

-- Step 1: Add new fields to payments table
ALTER TABLE payments 
ADD COLUMN qr_code LONGTEXT COMMENT 'QR code cho thanh toán online' AFTER status,
ADD COLUMN payment_url LONGTEXT COMMENT 'URL thanh toán (VNPay)' AFTER qr_code;

-- Step 2: Check current enum values
-- Before: 'pending', 'succeeded', 'failed'
-- After: 'pending', 'succeeded', 'failed', 'cancelled'

-- Step 3: Modify payment_method enum to support: 'cod', 'vnpay', 'momo', 'sebay'
ALTER TABLE payments 
MODIFY COLUMN payment_method ENUM('cod', 'vnpay', 'momo', 'sebay') NOT NULL;

-- Step 4: Modify status enum to include 'cancelled'
ALTER TABLE payments 
MODIFY COLUMN status ENUM('pending', 'succeeded', 'failed', 'cancelled') NOT NULL DEFAULT 'pending';

-- Step 5: Update orders table to use same enum for payment_method
ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('cod', 'vnpay', 'momo', 'sebay') NOT NULL;

-- Step 6: Verify changes
DESCRIBE payments;
DESCRIBE orders;

-- Output:
-- - payments table should have: qr_code, payment_url columns
-- - payment_method enum should support: cod, vnpay, momo, sebay
-- - status enum should support: pending, succeeded, failed, cancelled
-- - orders.payment_method should have same enum values
