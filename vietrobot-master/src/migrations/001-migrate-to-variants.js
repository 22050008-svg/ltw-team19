/**
 * MIGRATION SCRIPT: Migrate từ Product-based model sang ProductVariant-based model
 * 
 * Mục đích:
 * - Tạo ProductVariant mặc định cho mỗi Product hiện có
 * - Copy dữ liệu pricing/inventory từ Product → ProductVariant
 * - Update CartItem để trỏ tới ProductVariant thay vì Product
 * - Update OrderDetail để trỏ tới ProductVariant thay vì Product
 * - Thêm snapshot dữ liệu vào OrderDetail (variantAttributes, sku)
 * 
 * Cách chạy:
 * node src/migrations/001-migrate-to-variants.js
 * 
 * CẢNH BÁO: 
 * - Backup database trước khi chạy!!!
 * - Script này sẽ thực hiện các thay đổi vĩnh viễn trên database
 * - Nên test trên database dev trước khi chạy trên production
 */

const sequelize = require("../config/database");
const db = require("../models");

const {
  Product,
  ProductVariant,
  CartItem,
  OrderDetail,
  Order,
} = db;

const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[✓ SUCCESS] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[✗ ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[⚠ WARN] ${new Date().toISOString()} - ${msg}`),
};

async function runMigration() {
  let transaction = null;
  
  try {
    logger.info("========== MIGRATION: Product → ProductVariant ==========");
    logger.info("Bắt đầu migration...\n");

    // Bước 1: Kiểm tra database connection
    logger.info("Bước 1: Kiểm tra kết nối database...");
    await sequelize.authenticate();
    logger.success("Kết nối database thành công!\n");

    // Bước 2: Kiểm tra số lượng Product hiện có
    logger.info("Bước 2: Kiểm tra số lượng Product hiện có...");
    const totalProducts = await Product.count();
    logger.info(`Tổng số Product: ${totalProducts}`);

    if (totalProducts === 0) {
      logger.warn("Không có Product nào để migrate! Dừng migration.\n");
      return;
    }

    logger.info(`\nBước 3: Tạo default ProductVariant cho mỗi Product...`);
    
    // Lấy tất cả Product
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "sku",
        "price",
        "costPrice",
        "stockQuantity",
        "barcode",
      ],
    });

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Bước 4: Bắt đầu transaction
    transaction = await sequelize.transaction();
    logger.info("Transaction bắt đầu...\n");

    // Bước 5: Duyệt qua từng Product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = `[${i + 1}/${products.length}]`;

      try {
        // Kiểm tra xem đã tồn tại variant cho Product này chưa
        const existingVariant = await ProductVariant.findOne(
          {
            where: { product_id: product.id },
          },
          { transaction }
        );

        if (existingVariant) {
          logger.warn(`${progress} Product ID ${product.id}: Đã tồn tại ProductVariant, skip.`);
          skipCount++;
          continue;
        }

        // Tạo ProductVariant mặc định từ Product
        const variantData = {
          product_id: product.id,
          sku: product.sku || `SKU-${product.id}`, // Fallback nếu không có SKU
          name: product.name,
          attributes: JSON.stringify({}), // Default: không có attributes
          price: product.price || 0,
          cost_price: product.costPrice || 0,
          stock_quantity: product.stockQuantity || 0,
          barcode: product.barcode || null,
          image_url: null, // Để trống, sẽ migrate images riêng
          status: "active",
        };

        const variant = await ProductVariant.create(variantData, {
          transaction,
        });

        logger.success(
          `${progress} Product ID ${product.id}: Tạo ProductVariant ID ${variant.id} với SKU ${variant.sku}`
        );
        successCount++;
      } catch (error) {
        logger.error(
          `${progress} Product ID ${product.id}: Lỗi - ${error.message}`
        );
        errorCount++;
      }
    }

    logger.info(`\n---\n`);
    logger.info(`Tạo ProductVariant: Success=${successCount}, Skip=${skipCount}, Error=${errorCount}\n`);

    // Bước 6: Update CartItem - liên kết tới ProductVariant
    logger.info("Bước 4: Update CartItem để trỏ tới ProductVariant...");
    
    try {
      // Lấy tất cả CartItem có product_id
      const cartItems = await CartItem.findAll(
        {
          where: { product_id: { [sequelize.Sequelize.Op.not]: null } },
          attributes: ["id", "product_id", "quantity"],
        },
        { transaction }
      );

      logger.info(`Tổng CartItem cần update: ${cartItems.length}`);

      let cartUpdateSuccess = 0;
      let cartUpdateError = 0;

      for (const cartItem of cartItems) {
        try {
          // Tìm ProductVariant tương ứng với Product này
          const variant = await ProductVariant.findOne(
            {
              where: { product_id: cartItem.product_id },
            },
            { transaction }
          );

          if (!variant) {
            logger.warn(
              `CartItem ID ${cartItem.id}: Không tìm thấy ProductVariant cho Product ${cartItem.product_id}, skip.`
            );
            cartUpdateError++;
            continue;
          }

          // Update CartItem
          await cartItem.update(
            {
              product_variant_id: variant.id,
              product_id: null, // Clear old reference
            },
            { transaction }
          );

          logger.success(
            `CartItem ID ${cartItem.id}: Update product_variant_id → ${variant.id}`
          );
          cartUpdateSuccess++;
        } catch (error) {
          logger.error(
            `CartItem ID ${cartItem.id}: Lỗi - ${error.message}`
          );
          cartUpdateError++;
        }
      }

      logger.info(`CartItem Update: Success=${cartUpdateSuccess}, Error=${cartUpdateError}\n`);
    } catch (error) {
      logger.error(`Lỗi khi update CartItem: ${error.message}`);
      throw error;
    }

    // Bước 7: Update OrderDetail - liên kết tới ProductVariant + thêm snapshot
    logger.info("Bước 5: Update OrderDetail để trỏ tới ProductVariant...");
    
    try {
      const orderDetails = await OrderDetail.findAll(
        {
          where: { product_id: { [sequelize.Sequelize.Op.not]: null } },
          attributes: ["id", "product_id", "price_at_purchase"],
          include: [
            {
              model: Order,
              attributes: ["id"],
            },
          ],
        },
        { transaction }
      );

      logger.info(`Tổng OrderDetail cần update: ${orderDetails.length}`);

      let orderUpdateSuccess = 0;
      let orderUpdateError = 0;

      for (const orderDetail of orderDetails) {
        try {
          // Tìm ProductVariant tương ứng
          const variant = await ProductVariant.findOne(
            {
              where: { product_id: orderDetail.product_id },
              include: [{ model: Product, attributes: ["id", "sku"] }],
            },
            { transaction }
          );

          if (!variant) {
            logger.warn(
              `OrderDetail ID ${orderDetail.id}: Không tìm thấy ProductVariant cho Product ${orderDetail.product_id}, skip.`
            );
            orderUpdateError++;
            continue;
          }

          // Update OrderDetail với:
          // - product_variant_id: liên kết tới variant
          // - sku: snapshot SKU tại thời điểm mua
          // - variant_attributes: snapshot attributes (empty object vì không có thông tin cũ)
          // - product_id: clear old reference
          await orderDetail.update(
            {
              product_variant_id: variant.id,
              sku: variant.sku,
              variant_attributes: JSON.stringify({}), // Snapshot: empty (không có dữ liệu cũ)
              product_id: null,
            },
            { transaction }
          );

          logger.success(
            `OrderDetail ID ${orderDetail.id}: Update product_variant_id → ${variant.id}, sku → ${variant.sku}`
          );
          orderUpdateSuccess++;
        } catch (error) {
          logger.error(
            `OrderDetail ID ${orderDetail.id}: Lỗi - ${error.message}`
          );
          orderUpdateError++;
        }
      }

      logger.info(
        `OrderDetail Update: Success=${orderUpdateSuccess}, Error=${orderUpdateError}\n`
      );
    } catch (error) {
      logger.error(`Lỗi khi update OrderDetail: ${error.message}`);
      throw error;
    }

    // Bước 8: Commit transaction
    logger.info("Bước 6: Commit transaction...");
    await transaction.commit();
    logger.success("Transaction committed thành công!\n");

    // Bước 9: Xác nhận kết quả
    logger.info("Bước 7: Xác nhận kết quả migration...");
    const variantCount = await ProductVariant.count();
    const cartItemUpdated = await CartItem.count({
      where: { product_variant_id: { [sequelize.Sequelize.Op.not]: null } },
    });
    const orderDetailUpdated = await OrderDetail.count({
      where: { product_variant_id: { [sequelize.Sequelize.Op.not]: null } },
    });

    logger.success(
      `✓ Migration hoàn thành!\n` +
      `  - ProductVariant được tạo: ${variantCount}\n` +
      `  - CartItem được update: ${cartItemUpdated}\n` +
      `  - OrderDetail được update: ${orderDetailUpdated}\n`
    );

    logger.info("========== Migration thành công! ==========\n");
  } catch (error) {
    if (transaction) {
      logger.warn("Rollback transaction do lỗi...");
      await transaction.rollback();
    }
    logger.error(`\n========== MIGRATION FAILED ==========`);
    logger.error(`Lỗi: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Chạy migration
runMigration();
