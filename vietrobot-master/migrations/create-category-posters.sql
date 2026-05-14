-- Migration: Create category_posters table
ALTER TABLE `shop`.`categories` ADD COLUMN `poster_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL ảnh poster chính' AFTER `description`;

CREATE TABLE IF NOT EXISTS `category_posters` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID poster',
  `category_id` INT(11) DEFAULT NULL COMMENT 'ID danh mục (NULL nếu là homepage)',
  `image_url` VARCHAR(500) NOT NULL COMMENT 'URL hình ảnh',
  `title` VARCHAR(255) DEFAULT NULL COMMENT 'Tiêu đề poster',
  `description` TEXT DEFAULT NULL COMMENT 'Mô tả poster',
  `location` ENUM('homepage','category') DEFAULT 'category' COMMENT 'Vị trí poster (homepage hoặc category)',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `is_active` BOOLEAN DEFAULT 1 COMMENT 'Trạng thái hoạt động',
  `created_by` INT(11) DEFAULT NULL COMMENT 'Người tạo (user_id)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_category_id` (`category_id`),
  KEY `idx_location` (`location`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ poster của danh mục';

-- Add permissions for poster management
INSERT IGNORE INTO `permissions` (`name`, `description`, `module`) VALUES
('poster.create', 'Tạo poster danh mục', 'poster'),
('poster.read', 'Xem poster danh mục', 'poster'),
('poster.update', 'Cập nhật poster danh mục', 'poster'),
('poster.delete', 'Xóa poster danh mục', 'poster'),
('poster.manage_all', 'Quản lý tất cả poster', 'poster');

-- Assign permissions to admin and shop keeper roles
SELECT @admin_role_id:=id FROM roles WHERE name='admin' LIMIT 1;
SELECT @shop_role_id:=id FROM roles WHERE name='shop_keeper' LIMIT 1;

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT @admin_role_id, id FROM permissions WHERE module='poster';

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT @shop_role_id, id FROM permissions WHERE module='poster' AND name IN ('poster.create', 'poster.read', 'poster.update', 'poster.delete');
