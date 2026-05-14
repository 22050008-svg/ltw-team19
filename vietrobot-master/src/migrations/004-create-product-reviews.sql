-- Migration: Create ProductReview table
-- Created: 2026-03-01

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `title` VARCHAR(255),
  `comment` LONGTEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `helpful_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) 
    REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Indexes for better query performance
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_helpful_count` (`helpful_count`),
  UNIQUE KEY `uq_product_user` (`product_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed some sample data (optional)
-- INSERT INTO `product_reviews` (product_id, user_id, rating, title, comment, status)
-- VALUES 
--   (1, 2, 5, 'Sản phẩm tuyệt vời!', 'Chất lượng tốt, giao hàng nhanh', 'approved'),
--   (1, 3, 4, 'Rất hài lòng', 'Tuân thủ đúng như mô tả', 'approved'),
--   (2, 2, 3, 'Bình thường', 'Chất lượng trung bình', 'pending');
