// Setup Sequelize
const { Sequelize } = require('sequelize');
// Giả sử file config của bạn trông như thế này
// const configs = require("../config");
require('dotenv').config();
// Thay thế bằng thông tin cấu hình thực tế của bạn
const sequelize = new Sequelize(
    process.env.DB_NAME,      // Tên cơ sở dữ liệu
    process.env.DB_USER,      // Tên người dùng DB
    process.env.DB_PASSWORD,  // Mật khẩu DB
    {
        dialect: process.env.DB_DIALECT || 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        
        // ★ FIX: Add charset for Vietnamese support
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            supportBigNumbers: true,
            bigNumberStrings: true
        },
        
        // Tùy chọn: Tắt logging trong môi trường production để tối ưu hiệu năng
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
    }
);

(async() => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();

// Khởi tạo models
const User = require("./User")(sequelize);
const Product = require("./Product")(sequelize);
const Category = require("./Category")(sequelize);
const Order = require("./Order")(sequelize);
const OrderDetail = require("./OrderDetail")(sequelize);
const Voucher = require("./Voucher")(sequelize);
const Role = require("./Role")(sequelize);
const Permission = require("./Permission")(sequelize);
const StockMovement = require("./StockMovement")(sequelize);
const Transaction = require("./Transaction")(sequelize);
const UserRoles = require("./UserRoles")(sequelize);
const RolePermissions = require("./RolePermissions")(sequelize);
const Cart = require("./Cart")(sequelize);
const CartItem = require("./CartItem")(sequelize);
const Address = require("./Address")(sequelize);
const Payment = require("./Payment")(sequelize);
const MailConfig = require("./MailConfig")(sequelize);

// ★ NEW MODELS FOR PRODUCT VARIANTS
const ProductAttribute = require("./ProductAttribute")(sequelize);
const ProductAttributeValue = require("./ProductAttributeValue")(sequelize);
const ProductVariant = require("./ProductVariant")(sequelize);
const ProductImage = require("./ProductImage")(sequelize);

// ★ NEW MODEL FOR PRODUCT REVIEWS
const ProductReview = require("./ProductReview")(sequelize);

// ★ NEW MODEL FOR REVIEW REPLIES (Seller/Staff response to reviews)
const ReviewReply = require("./ReviewReply")(sequelize);

// ★ NEW MODEL FOR REVIEW IMAGES (Customer uploaded images with reviews)
const ReviewImage = require("./ReviewImage")(sequelize);

// ★ NEW MODEL FOR CATEGORY POSTERS
const CategoryPoster = require("./CategoryPoster")(sequelize);

// --- Định nghĩa relationship giữa các models ---

// ★ SECTION: ProductAttribute & ProductVariant Relationships
// ProductAttribute 1 - M ProductAttributeValue
ProductAttribute.hasMany(ProductAttributeValue, { 
    foreignKey: 'attributeId', 
    as: 'values' 
});
ProductAttributeValue.belongsTo(ProductAttribute, { 
    foreignKey: 'attributeId', 
    as: 'attribute' 
});

// Product 1 - M ProductVariant
Product.hasMany(ProductVariant, { 
    foreignKey: 'productId', 
    as: 'variants' 
});
ProductVariant.belongsTo(Product, { 
    foreignKey: 'productId', 
    as: 'product' 
});

// ProductVariant 1 - M ProductImage
ProductVariant.hasMany(ProductImage, { 
    foreignKey: 'productVariantId', 
    as: 'variantImages' 
});
ProductImage.belongsTo(ProductVariant, { 
    foreignKey: 'productVariantId', 
    as: 'variant' 
});

// Product 1 - M ProductImage (ảnh chung)
Product.hasMany(ProductImage, { 
    foreignKey: 'productId', 
    as: 'productImages' 
});
ProductImage.belongsTo(Product, { 
    foreignKey: 'productId', 
    as: 'product' 
});

// ProductVariant 1 - M CartItem (★ THAY ĐỔI từ Product)
ProductVariant.hasMany(CartItem, { 
    foreignKey: 'productVariantId', 
    as: 'cartItems' 
});
CartItem.belongsTo(ProductVariant, { 
    foreignKey: 'productVariantId', 
    as: 'variant' 
});

// ProductVariant 1 - M OrderDetail (★ THAY ĐỔI từ Product)
ProductVariant.hasMany(OrderDetail, { 
    foreignKey: 'productVariantId', 
    as: 'orderDetails' 
});
OrderDetail.belongsTo(ProductVariant, { 
    foreignKey: 'productVariantId', 
    as: 'variant' 
});

// Product 1 - M ProductReview (★ NEW)
Product.hasMany(ProductReview, { 
    foreignKey: 'productId', 
    as: 'reviews' 
});
ProductReview.belongsTo(Product, { 
    foreignKey: 'productId', 
    as: 'product' 
});

// User 1 - M ProductReview (★ NEW)
User.hasMany(ProductReview, { 
    foreignKey: 'userId', 
    as: 'productReviews' 
});
ProductReview.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'reviewer' 
});

// ProductReview 1 - M ReviewReply (★ NEW - Seller/Staff replies to reviews)
ProductReview.hasMany(ReviewReply, { 
    foreignKey: 'reviewId', 
    as: 'replies',
    onDelete: 'CASCADE'
});
ReviewReply.belongsTo(ProductReview, { 
    foreignKey: 'reviewId', 
    as: 'review' 
});

// ProductReview 1 - M ReviewImage (★ NEW - Images uploaded with review)
ProductReview.hasMany(ReviewImage, { 
    foreignKey: 'reviewId', 
    as: 'images',
    onDelete: 'CASCADE'
});
ReviewImage.belongsTo(ProductReview, { 
    foreignKey: 'reviewId', 
    as: 'review' 
});

// User 1 - M ReviewReply (★ NEW - Staff member who replied)
User.hasMany(ReviewReply, { 
    foreignKey: 'userId', 
    as: 'reviewReplies' 
});
ReviewReply.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'staff' 
});

// Nhóm 1: Models Kinh doanh
// Category 1 - n Product
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// User 1 - n Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "customer" });

// Order M - M Product (thông qua OrderDetail) - use constraints: false to avoid extra indexes
Order.belongsToMany(Product, { through: OrderDetail, foreignKey: "orderId", as: "products", constraints: false });
Product.belongsToMany(Order, { through: OrderDetail, foreignKey: "productId", as: "orders", constraints: false });

// Nhóm 2: Models Phân quyền & Bảo mật
// User M - M Role (thông qua UserRoles)
User.belongsToMany(Role, { through: UserRoles, foreignKey: 'userId', as: 'roles', constraints: false });
Role.belongsToMany(User, { through: UserRoles, foreignKey: 'roleId', as: 'users', constraints: false });

// Role M - M Permission (thông qua RolePermissions)
Role.belongsToMany(Permission, { through: RolePermissions, foreignKey: 'roleId', as: 'permissions', constraints: false });
Permission.belongsToMany(Role, { through: RolePermissions, foreignKey: 'permissionId', as: 'roles', constraints: false });

// Nhóm 3: Models Quản lý Kho & Ngân sách
// Product 1 - n StockMovement
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User 1 - n StockMovement
User.hasMany(StockMovement, { foreignKey: 'userId', as: 'stockActivities' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'staff' });

// User 1 - n Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'staff' });

// Order 1 - 1 Transaction (optional)
Order.hasOne(Transaction, { foreignKey: 'orderId', as: 'transaction' });
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Order 1 - 1 Payment
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart 1 - M CartItem
Cart.hasMany(CartItem, { 
    foreignKey: 'cartId', 
    as: 'items' 
});
CartItem.belongsTo(Cart, { 
    foreignKey: 'cartId', 
    as: 'cart' 
});

// Order 1 - M OrderDetail
Order.hasMany(OrderDetail, { 
    foreignKey: 'orderId', 
    as: 'items' 
});
OrderDetail.belongsTo(Order, { 
    foreignKey: 'orderId', 
    as: 'order' 
});

// NESTED: CartItem -> Product (for easier querying)
CartItem.belongsTo(Product, { 
    foreignKey: 'productId',
    targetKey: 'id',
    as: 'product',
    constraints: false  // Không enforce FK trong DB
});

// NESTED: OrderDetail -> Product (for easier querying)
OrderDetail.belongsTo(Product, { 
    foreignKey: 'productId',
    targetKey: 'id',
    as: 'product',
    constraints: false
});

User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ★ Category 1 - M CategoryPoster
Category.hasMany(CategoryPoster, {
    foreignKey: 'categoryId',
    as: 'posters'
});
CategoryPoster.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// User 1 - M CategoryPoster
User.hasMany(CategoryPoster, {
    foreignKey: 'createdBy',
    as: 'createdPosters'
});
CategoryPoster.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});

// Đồng bộ hóa tất cả các model với cơ sở dữ liệu
// sequelize.sync({ alter: true }); // Dùng { force: true } để xóa và tạo lại bảng

module.exports = {
    sequelize,
    User,
    Product,
    Category,
    Order,
    OrderDetail,
    Voucher,
    Role,
    Permission,
    StockMovement,
    Transaction,
    UserRoles,
    RolePermissions,
    Cart,
    CartItem,
    Address,
    Payment,
    MailConfig,
    // ★ NEW EXPORTS
    ProductAttribute,
    ProductAttributeValue,
    ProductVariant,
    ProductImage,
    ProductReview,
    ReviewReply,
    ReviewImage,
    CategoryPoster
};