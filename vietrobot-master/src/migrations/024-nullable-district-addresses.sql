-- Migration 024: Cho phép NULL trên cột district sau sáp nhập tỉnh 2025
-- Việt Nam còn 34 tỉnh/thành, không còn cấp quận/huyện

ALTER TABLE `shop`.`addresses`
  MODIFY COLUMN `district_code` INT NULL,
  MODIFY COLUMN `district_name` VARCHAR(255) NULL;
