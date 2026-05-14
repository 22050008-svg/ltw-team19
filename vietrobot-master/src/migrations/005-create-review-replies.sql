-- Migration: 005-create-review-replies.sql
-- Description: Create review_replies table for seller/staff responses to product reviews
-- Created: March 2026

-- Create review_replies table
CREATE TABLE IF NOT EXISTS review_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    comment LONGTEXT NOT NULL,
    is_official BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_review_replies_review_id 
        FOREIGN KEY (review_id) REFERENCES product_reviews(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_review_replies_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_official (is_official),
    INDEX idx_created_at (created_at)
);

-- Optional: Add comment to table
ALTER TABLE review_replies COMMENT = 'Store seller/staff replies to product reviews';
