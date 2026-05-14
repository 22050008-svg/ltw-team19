-- Migration: Fix ReviewImage table to support base64 image data
-- Purpose: Change imageUrl column from STRING(500) to LONGTEXT to store base64 encoded images
-- This migration must be run manually or via a migration tool

USE shop;

-- Step 1: Drop any existing unique constraints on imageUrl if present
ALTER TABLE review_images DROP INDEX IF EXISTS imageUrl;

-- Step 2: Modify the imageUrl column to LONGTEXT
ALTER TABLE review_images 
MODIFY COLUMN image_url LONGTEXT COLLATE utf8mb4_unicode_ci NOT NULL 
COMMENT 'URL ảnh đánh giá hoặc base64 data';

-- Step 3: Verify the change
DESCRIBE review_images;

-- Output: Should show image_url as type 'longtext'
