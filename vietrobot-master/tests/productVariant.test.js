/**
 * PHASE 5: INTEGRATION TESTS 
 * Test suite cho ProductVariant system upgrade
 * 
 * Cách chạy:
 * npm install --save-dev mocha chai
 * npx mocha tests/productVariant.test.js
 * 
 * Hoặc chạy tất cả tests:
 * npm run test
 */

const assert = require("assert");
const sequelize = require("../config/database");
const db = require("../models");

const {
  Product,
  ProductVariant,
  ProductAttribute,
  ProductAttributeValue,
  CartItem,
  OrderDetail,
  Cart,
  Order,
  User,
} = db;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

async function setupTestDatabase() {
  // Clear test data
  await sequelize.sync({ force: true });
  console.log("✓ Test database setup complete");
}

async function cleanupTestDatabase() {
  await sequelize.drop();
  console.log("✓ Test database cleanup complete");
}

async function createTestProduct(name = "Test Product") {
  return Product.create({
    name,
    description: "Test description",
    category_id: 1,
  });
}

async function createTestVariant(productId, data = {}) {
  return ProductVariant.create({
    product_id: productId,
    sku: data.sku || `SKU-${Date.now()}`,
    name: data.name || "Test Variant",
    attributes: JSON.stringify({}),
    price: data.price || 100.0,
    cost_price: data.cost_price || 50.0,
    stock_quantity: data.stock_quantity || 10,
    status: data.status || "active",
  });
}

async function createTestUser() {
  return User.create({
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "hashed_password",
  });
}

async function createTestCart(userId) {
  return Cart.create({
    user_id: userId,
  });
}

async function createTestOrder(userId, cartId) {
  return Order.create({
    user_id: userId,
    cart_id: cartId,
    payment_status: "pending",
    shipping_status: "pending",
    total_amount: 100.0,
  });
}

// ============================================================
// TEST SUITE 1: ProductVariant CRUD
// ============================================================

async function testProductVariantCRUD() {
  console.log("\n========== TEST SUITE 1: ProductVariant CRUD ==========");

  try {
    // Create Product first
    const product = await createTestProduct("Phone");
    assert(product.id, "Product should have ID");
    console.log("✓ Product created");

    // Test 1.1: Create ProductVariant
    console.log("\n[TEST 1.1] Create ProductVariant");
    const variant = await createTestVariant(product.id, {
      sku: "PHONE-001",
      price: 500.0,
      stock_quantity: 20,
    });
    assert(variant.id, "Variant should have ID");
    assert.strictEqual(variant.sku, "PHONE-001");
    assert.strictEqual(variant.price, 500.0);
    assert.strictEqual(variant.stock_quantity, 20);
    console.log("✓ ProductVariant created successfully");

    // Test 1.2: Read ProductVariant
    console.log("\n[TEST 1.2] Read ProductVariant");
    const fetchedVariant = await ProductVariant.findByPk(variant.id);
    assert(fetchedVariant, "Variant should exist");
    assert.strictEqual(fetchedVariant.sku, "PHONE-001");
    console.log("✓ ProductVariant retrieved successfully");

    // Test 1.3: Update ProductVariant
    console.log("\n[TEST 1.3] Update ProductVariant");
    await variant.update({ price: 450.0, stock_quantity: 18 });
    const updatedVariant = await ProductVariant.findByPk(variant.id);
    assert.strictEqual(updatedVariant.price, 450.0);
    assert.strictEqual(updatedVariant.stock_quantity, 18);
    console.log("✓ ProductVariant updated successfully");

    // Test 1.4: Delete ProductVariant
    console.log("\n[TEST 1.4] Delete ProductVariant");
    await variant.destroy();
    const deletedVariant = await ProductVariant.findByPk(variant.id);
    assert(!deletedVariant, "Variant should be deleted");
    console.log("✓ ProductVariant deleted successfully");

    console.log("\n✅ TEST SUITE 1 PASSED");
  } catch (error) {
    console.error(`❌ TEST SUITE 1 FAILED: ${error.message}`);
    throw error;
  }
}

// ============================================================
// TEST SUITE 2: Stock Management (decrementStock/incrementStock)
// ============================================================

async function testStockManagement() {
  console.log("\n========== TEST SUITE 2: Stock Management ==========");

  try {
    // Setup
    const product = await createTestProduct("Laptop");
    const variant = await createTestVariant(product.id, {
      stock_quantity: 100,
    });
    console.log("✓ Setup: Variant with 100 stock created");

    // Test 2.1: Decrement Stock - Valid
    console.log("\n[TEST 2.1] Decrement Stock - Valid");
    await variant.decrement("stock_quantity", { by: 10 });
    await variant.reload();
    assert.strictEqual(variant.stock_quantity, 90);
    console.log("✓ Stock decremented from 100 → 90");

    // Test 2.2: Decrement Stock - Valid (multiple times)
    console.log("\n[TEST 2.2] Decrement Stock - Multiple times");
    await variant.decrement("stock_quantity", { by: 50 });
    await variant.reload();
    assert.strictEqual(variant.stock_quantity, 40);
    console.log("✓ Stock decremented from 90 → 40");

    // Test 2.3: Increment Stock
    console.log("\n[TEST 2.3] Increment Stock");
    await variant.increment("stock_quantity", { by: 30 });
    await variant.reload();
    assert.strictEqual(variant.stock_quantity, 70);
    console.log("✓ Stock incremented from 40 → 70");

    // Test 2.4: Stock availability check
    console.log("\n[TEST 2.4] Stock availability check");
    assert(variant.stock_quantity >= 50, "Should have enough stock");
    console.log("✓ Stock availability verified (70 >= 50)");

    console.log("\n✅ TEST SUITE 2 PASSED");
  } catch (error) {
    console.error(`❌ TEST SUITE 2 FAILED: ${error.message}`);
    throw error;
  }
}

// ============================================================
// TEST SUITE 3: Cart and CartItem with ProductVariant
// ============================================================

async function testCartWithVariants() {
  console.log("\n========== TEST SUITE 3: Cart & CartItem ==========");

  try {
    // Setup
    const user = await createTestUser();
    const cart = await createTestCart(user.id);
    const product = await createTestProduct("Shirt");
    const variant = await createTestVariant(product.id, {
      sku: "SHIRT-001",
      price: 25.0,
    });
    console.log("✓ Setup: User, Cart, Product, Variant created");

    // Test 3.1: Add ProductVariant to Cart
    console.log("\n[TEST 3.1] Add ProductVariant to Cart");
    const cartItem = await CartItem.create({
      cart_id: cart.id,
      product_variant_id: variant.id,
      quantity: 3,
    });
    assert(cartItem.id, "CartItem should have ID");
    assert.strictEqual(cartItem.product_variant_id, variant.id);
    assert.strictEqual(cartItem.quantity, 3);
    console.log("✓ ProductVariant added to cart with quantity 3");

    // Test 3.2: Retrieve Cart with Items and Variant Details
    console.log("\n[TEST 3.2] Get Cart with Variant Details");
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: {
        model: CartItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "productVariant",
            include: {
              model: Product,
              as: "product",
            },
          },
        ],
      },
    });
    assert(cartWithItems.items.length, 1);
    assert.strictEqual(cartWithItems.items[0].productVariant.sku, "SHIRT-001");
    console.log(
      "✓ Cart retrieved with nested variant and product details"
    );

    // Test 3.3: Update CartItem Quantity
    console.log("\n[TEST 3.3] Update CartItem Quantity");
    await cartItem.update({ quantity: 5 });
    const updatedCartItem = await CartItem.findByPk(cartItem.id);
    assert.strictEqual(updatedCartItem.quantity, 5);
    console.log("✓ CartItem quantity updated: 3 → 5");

    // Test 3.4: Remove CartItem
    console.log("\n[TEST 3.4] Remove CartItem");
    await cartItem.destroy();
    const deletedItem = await CartItem.findByPk(cartItem.id);
    assert(!deletedItem, "CartItem should be deleted");
    console.log("✓ CartItem removed from cart");

    console.log("\n✅ TEST SUITE 3 PASSED");
  } catch (error) {
    console.error(`❌ TEST SUITE 3 FAILED: ${error.message}`);
    throw error;
  }
}

// ============================================================
// TEST SUITE 4: Order and OrderDetail with ProductVariant
// ============================================================

async function testOrderWithVariants() {
  console.log("\n========== TEST SUITE 4: Order & OrderDetail ==========");

  try {
    // Setup
    const user = await createTestUser();
    const cart = await createTestCart(user.id);
    const product = await createTestProduct("Watch");
    const variant = await createTestVariant(product.id, {
      sku: "WATCH-001",
      price: 150.0,
      stock_quantity: 5,
    });
    console.log("✓ Setup: User, Cart, Product, Variant created");

    // Test 4.1: Create Order
    console.log("\n[TEST 4.1] Create Order");
    const order = await createTestOrder(user.id, cart.id);
    assert(order.id, "Order should have ID");
    assert.strictEqual(order.user_id, user.id);
    console.log("✓ Order created successfully");

    // Test 4.2: Create OrderDetail with Variant Snapshot
    console.log("\n[TEST 4.2] Create OrderDetail with Variant Snapshot");
    const orderDetail = await OrderDetail.create({
      order_id: order.id,
      product_variant_id: variant.id,
      sku: variant.sku, // Snapshot of SKU
      variant_attributes: JSON.stringify({ size: "M", color: "Silver" }), // Snapshot of attributes
      quantity: 2,
      price_at_purchase: variant.price, // Snapshot of price
    });
    assert(orderDetail.id, "OrderDetail should have ID");
    assert.strictEqual(orderDetail.sku, "WATCH-001");
    assert.strictEqual(orderDetail.product_variant_id, variant.id);
    console.log("✓ OrderDetail created with variant snapshot");

    // Test 4.3: Retrieve Order with OrderDetail and Variant Info
    console.log("\n[TEST 4.3] Get Order with OrderDetail & Variant");
    const orderWithDetails = await Order.findByPk(order.id, {
      include: {
        model: OrderDetail,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "productVariant",
            include: {
              model: Product,
            },
          },
        ],
      },
    });
    assert(orderWithDetails.items.length === 1);
    assert.strictEqual(orderWithDetails.items[0].sku, "WATCH-001");
    assert.strictEqual(orderWithDetails.items[0].quantity, 2);
    console.log("✓ Order retrieved with nested OrderDetail and Variant");

    // Test 4.4: Verify Variant Attributes Snapshot
    console.log("\n[TEST 4.4] Verify Variant Attributes Snapshot");
    const detailedItem = await OrderDetail.findByPk(orderDetail.id);
    const attributes = JSON.parse(detailedItem.variant_attributes);
    assert.strictEqual(attributes.size, "M");
    assert.strictEqual(attributes.color, "Silver");
    console.log("✓ Variant attributes snapshot preserved correctly");

    console.log("\n✅ TEST SUITE 4 PASSED");
  } catch (error) {
    console.error(`❌ TEST SUITE 4 FAILED: ${error.message}`);
    throw error;
  }
}

// ============================================================
// TEST SUITE 5: Relationships & Cascading
// ============================================================

async function testRelationships() {
  console.log("\n========== TEST SUITE 5: Relationships & Cascading ==========");

  try {
    // Test 5.1: Product → Multiple Variants
    console.log("\n[TEST 5.1] Product → Multiple Variants");
    const product = await createTestProduct("Sneaker");
    const variant1 = await createTestVariant(product.id, {
      sku: "SNEAKER-001-S",
    });
    const variant2 = await createTestVariant(product.id, {
      sku: "SNEAKER-001-M",
    });
    const variant3 = await createTestVariant(product.id, {
      sku: "SNEAKER-001-L",
    });

    const productWithVariants = await Product.findByPk(product.id, {
      include: { model: ProductVariant, as: "variants" },
    });
    assert.strictEqual(productWithVariants.variants.length, 3);
    console.log("✓ Product has 3 variants with different SKUs");

    // Test 5.2: Cart → Multiple CartItems with Various Variants
    console.log("\n[TEST 5.2] Cart → Multiple CartItems");
    const user = await createTestUser();
    const cart = await createTestCart(user.id);
    const item1 = await CartItem.create({
      cart_id: cart.id,
      product_variant_id: variant1.id,
      quantity: 1,
    });
    const item2 = await CartItem.create({
      cart_id: cart.id,
      product_variant_id: variant2.id,
      quantity: 2,
    });
    const item3 = await CartItem.create({
      cart_id: cart.id,
      product_variant_id: variant3.id,
      quantity: 1,
    });

    const cartWithAllItems = await Cart.findByPk(cart.id, {
      include: { model: CartItem, as: "items" },
    });
    assert.strictEqual(cartWithAllItems.items.length, 3);
    console.log("✓ Cart contains 3 items from different variants");

    // Test 5.3: Order → Multiple OrderDetails from Same Product
    console.log("\n[TEST 5.3] Order → Multiple OrderDetails");
    const order = await createTestOrder(user.id, cart.id);
    const detail1 = await OrderDetail.create({
      order_id: order.id,
      product_variant_id: variant1.id,
      sku: variant1.sku,
      quantity: 1,
      price_at_purchase: 80.0,
    });
    const detail2 = await OrderDetail.create({
      order_id: order.id,
      product_variant_id: variant2.id,
      sku: variant2.sku,
      quantity: 2,
      price_at_purchase: 85.0,
    });

    const orderWithAllDetails = await Order.findByPk(order.id, {
      include: { model: OrderDetail, as: "items" },
    });
    assert.strictEqual(orderWithAllDetails.items.length, 2);
    console.log("✓ Order contains 2 OrderDetails from different variants");

    console.log("\n✅ TEST SUITE 5 PASSED");
  } catch (error) {
    console.error(`❌ TEST SUITE 5 FAILED: ${error.message}`);
    throw error;
  }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function runAllTests() {
  try {
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║   PHASE 5: INTEGRATION TESTS - START                 ║");
    console.log("╚═══════════════════════════════════════════════════════╝");

    await setupTestDatabase();

    // Run all test suites
    await testProductVariantCRUD();
    await testStockManagement();
    await testCartWithVariants();
    await testOrderWithVariants();
    await testRelationships();

    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║   ✅ ALL TESTS PASSED! - ProductVariant System Works  ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    await cleanupTestDatabase();
    process.exit(0);
  } catch (error) {
    console.error("\n╔═══════════════════════════════════════════════════════╗");
    console.error("║   ❌ TESTS FAILED!                                    ║");
    console.error("╚═══════════════════════════════════════════════════════╝\n");
    process.exit(1);
  }
}

// Run when executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testProductVariantCRUD,
  testStockManagement,
  testCartWithVariants,
  testOrderWithVariants,
  testRelationships,
};
