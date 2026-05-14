# Phase 4: Data Migration - Product → ProductVariant

## Mô tả
Migrate dữ liệu từ Product-based model sang ProductVariant-based model. Script này sẽ:
1. Tạo ProductVariant mặc định cho mỗi Product hiện có
2. Copy dữ liệu (SKU, price, costPrice, stockQuantity) từ Product → ProductVariant  
3. Update CartItem để trỏ tới ProductVariant thay vì Product
4. Update OrderDetail để trỏ tới ProductVariant + thêm snapshot dữ liệu

## Cảnh báo ⚠️
- **BACKUP DATABASE TRƯỚC KHI CHẠY!** Đây là thay đổi vĩnh viễn
- Nên test trên database dev trước khi chạy trên production
- Migration có transaction, nếu lỗi sẽ tự động rollback
- Không chạy 2 lần trên cùng database (ProductVariant đã tồn tại sẽ skip)

## Cách chạy

### 1️⃣ Backup Database Trước
```bash
# MySQL - dump backup
mysqldump -u root -p web_ban_hang > backup_$(date +%Y%m%d_%H%M%S).sql

# Hoặc dùng GUI tool như phpMyAdmin hoặc DBeaver
```

### 2️⃣ Chạy Migration Script
```bash
# Từ thư mục root project
node src/migrations/001-migrate-to-variants.js

# Hoặc từ bất kỳ đâu
node /path/to/vietrobot-master/src/migrations/001-migrate-to-variants.js
```

### 3️⃣ Xem Output
Script sẽ hiển thị chi tiết:
```
[INFO] ... - Bước 1: Kiểm tra kết nối database...
[✓ SUCCESS] ... - Kết nối database thành công!

[INFO] ... - Bước 2: Kiểm tra số lượng Product hiện có...
[INFO] ... - Tổng số Product: 50

[INFO] ... - Bước 3: Tạo default ProductVariant cho mỗi Product...
[✓ SUCCESS] [1/50] Product ID 1: Tạo ProductVariant ID 1 với SKU SKU-001
[✓ SUCCESS] [2/50] Product ID 2: Tạo ProductVariant ID 2 với SKU SKU-002
...

[INFO] CartItem Update: Success=25, Error=0

[INFO] OrderDetail Update: Success=150, Error=0

[✓ SUCCESS] ✓ Migration hoàn thành!
  - ProductVariant được tạo: 50
  - CartItem được update: 25
  - OrderDetail được update: 150
```

## Xử lý lỗi

### Lỗi: "Không có Product nào để migrate"
→ Database hoàn toàn trống, tuỳ ý tiếp tục

### Lỗi: "Lỗi kết nối database"
→ Kiểm tra .env file, database URL, credentials

### Lỗi: "product_id is not null"
→ Foreign key constraint, migrated data chưa valid
→ Kiểm tra transaction log, có thể rollback xảy ra

### Nếu Migration Dừng Giữa Chừng
→ Database đã được rollback tự động (transaction)
→ Không cần lo, dữ liệu cũ vẫn nguyên vẹn
→ Fix lỗi và chạy lại

## Sau Migration

### ✓ Xác nhận trong Database
```sql
-- Kiểm tra ProductVariant được tạo
SELECT COUNT(*) FROM product_variants;  -- Phải = số Product cũ

-- Kiểm tra CartItem được update
SELECT COUNT(*) FROM cart_items WHERE product_variant_id IS NOT NULL;

-- Kiểm tra OrderDetail được update
SELECT COUNT(*) FROM order_details WHERE product_variant_id IS NOT NULL;

-- Kiểm tra không còn reference đến Product cũ
SELECT COUNT(*) FROM cart_items WHERE product_id IS NOT NULL;  -- Phải = 0
SELECT COUNT(*) FROM order_details WHERE product_id IS NOT NULL;  -- Phải = 0
```

### ✓ Test API Endpoints
```bash
# Lấy sản phẩm + variants
curl http://localhost:3000/api/v1/products/:id

# Xem giỏ hàng (phải có productVariantId)
curl http://localhost:3000/api/v1/cart

# Lược kỳ orders (phải có productVariantId trong order details)
curl http://localhost:3000/api/v1/orders/:id
```

### ✓ Cập nhật Frontend  
Frontend cần update để sử dụng `productVariantId` thay vì `productId`:
- Add to cart request: `{productVariantId: 123, quantity: 1}`
- Cart item display: Hiển thị ProductVariant details (SKU, price, etc)
- Order history: Hiển thị variant snapshot từ OrderDetail

## Database Schema Changes

### Trước Migration (Old)
```
Product (id, name, sku, price, costPrice, stockQuantity, ...)
  ↓ references through productId FK
CartItem (cartId, productId, quantity)
OrderDetail (orderId, productId, priceAtPurchase)
```

### Sau Migration (New)
```
Product (id, name, description, ...)
  ↓ has many
ProductVariant (id, productId, sku, price, costPrice, stockQuantity, ...)
  ↓ references through productVariantId FK
CartItem (cartId, productVariantId, quantity)
OrderDetail (orderId, productVariantId, sku, variantAttributes, priceAtPurchase)
```

## Rollback (Jika Diperlukan)

Nếu migration gặp vấn đề, restore backup:
```bash
# Restore dari backup
mysql -u root -p web_ban_hang < backup_20240115_143022.sql
```

Atau nếu chỉ một số record bị lỗi:
```sql
-- Kiểm tra CartItem/OrderDetail còn trỏ tới Product cũ
SELECT ci.*, ci.product_id 
FROM cart_items ci 
WHERE ci.product_id IS NOT NULL;

-- Manual fix nếu cần
UPDATE cart_items SET product_variant_id = 123 WHERE product_id = 45;
```

## Checklist Pra- dan Post-Migration

```
PRE-MIGRATION:
☐ Backup database
☐ Test script trên dev database
☐ Thông báo team không commit changes trong khi migration
☐ Xác nhận kết nối database đúng

MIGRATION:
☐ Chạy script: node src/migrations/001-migrate-to-variants.js
☐ Đợi hoàn thành (~5-10 phút tùy DB size)
☐ Kiểm tra output log

POST-MIGRATION:
☐ Xác nhận SQL queries trên database
☐ Test API endpoints
☐ Check frontend hoạt động đúng
☐ Monitor error logs 30 phút đầu
☐ Announce to team migration thành công
```

---
**Created**: Phase 4 Data Migration
**Status**: Ready for execution
**Last Updated**: $(date)
