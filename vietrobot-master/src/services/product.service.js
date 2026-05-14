// services/product.service.js
const { Product, Category, ProductVariant, ProductReview, ProductImage, ProductVariantAttribute, ProductAttribute, sequelize } = require("../models");
const { AppError } = require("../helpers/error");
const { Op } = require("sequelize");
const fs = require('fs/promises');
const path = require('path');

// ====================================================================
// SECTION: HELPER FUNCTIONS
// ====================================================================

/**
 * Lấy thống kê đánh giá của sản phẩm
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<object>} - Thống kê đánh giá (average rating, total reviews)
 */
const getReviewStats = async (productId) => {
    try {
        const reviews = await ProductReview.findAll({
            where: { productId, status: 'approved' }
        });

        if (reviews.length === 0) {
            return {
                avgRating: 0,
                totalReviews: 0
            };
        }

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
        });

        return {
            avgRating: parseFloat((totalRating / reviews.length).toFixed(1)),
            totalReviews: reviews.length
        };
    } catch (error) {
        console.error("getReviewStats service error:", error);
        // Return default stats if error occurs
        return {
            avgRating: 0,
            totalReviews: 0
        };
    }
};

// ====================================================================
// SECTION: PUBLIC SERVICES (Dành cho Khách hàng)
// ====================================================================

/**
 * Lấy danh sách sản phẩm công khai với bộ lọc và phân trang.
 * @param {object} queryParams - Các tham số lọc { page, limit, search, categoryId, sortBy, attributes }
 * @returns {Promise<object>} - Danh sách sản phẩm và thông tin phân trang.
 */
const getPublicProducts = async (queryParams) => {
    try {
        const { page = 1, limit = 10, search, categoryId, sortBy, attributes, priceMin, priceMax } = queryParams;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        if (search) {
            // Search only in Product name and description (sku is now in ProductVariant)
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const orderClause = [['createdAt', 'DESC']]; // Mặc định sắp xếp theo sản phẩm mới nhất
        if (sortBy) {
            const [field, order] = sortBy.split(':'); // ví dụ: 'name:asc'
            // Only allow sorting by name and createdAt (price is now in ProductVariant)
            if (['name', 'createdAt'].includes(field) && ['ASC', 'DESC'].includes(order.toUpperCase())) {
                orderClause.unshift([field, order.toUpperCase()]); // Thêm vào đầu để ưu tiên
            }
        }

        // Parse attribute filters
        let attributeFilters = {};
        if (attributes) {
            try {
                attributeFilters = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
            } catch (e) {
                console.warn('Invalid attributes JSON:', attributes);
            }
        }

        // Build include array with conditions for attribute filtering
        const include = [
            { model: Category, as: "category", attributes: ['id', 'name'] },
            { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
        ];

        // If attributes filter is provided, add JOIN for variant attributes
        if (Object.keys(attributeFilters).length > 0) {
            include.push({
                model: ProductVariant,
                as: 'variantsWithAttributes',
                attributes: [],
                include: [{
                    model: ProductVariantAttribute,
                    as: 'attributes',
                    attributes: [],
                    include: [{
                        model: ProductAttribute,
                        as: 'productAttribute',
                        where: {
                            name: Object.keys(attributeFilters)
                        },
                        attributes: []
                    }],
                    where: {
                        value: {
                            [Op.in]: Object.values(attributeFilters)
                        }
                    },
                    required: true
                }],
                required: true
            });
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: include,
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            distinct: true,
            subQuery: false  // Prevent subquery issues with multiple includes
        });

        // Get productImages separately for each product to avoid limit/offset issues
        const productsWithImages = await Promise.all(rows.map(async (product) => {
            const productJson = product.toJSON();
            // Fetch productImages separately
            const productImages = await ProductImage.findAll({
                where: { 
                    productId: product.id,
                    productVariantId: null 
                },
                attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
                order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']],
                limit: 1
            });
            productJson.productImages = productImages;
            return productJson;
        }));

        // Add rating stats to each product
        const productsWithRatings = await Promise.all(productsWithImages.map(async (product) => {
            const stats = await getReviewStats(product.id);
            return {
                ...product,
                rating: {
                    averageRating: stats.avgRating,
                    totalReviews: stats.totalReviews
                }
            };
        }));

        return {
            data: productsWithRatings,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit),
            },
        };
    } catch (error) {
        console.error("getPublicProducts service error:", error);
        throw new AppError(500, "Không thể lấy danh sách sản phẩm");
    }
};

/**
 * Lấy chi tiết một sản phẩm công khai.
 * @param {number} productId - ID của sản phẩm.
 * @returns {Promise<Product>} - Chi tiết sản phẩm.
 */
const getPublicProductById = async (productId) => {
    try {
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'name', 'description', 'htmlDescription', 'specifications', 'usageGuide', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [
                { model: Category, as: "category", attributes: ['id', 'name'] },
                { 
                    model: ProductImage, 
                    as: 'productImages',
                    attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
                    where: { productVariantId: null },
                    required: false,
                    order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
                },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'stock_quantity', 'status', 'attributes'] }
            ],
        });

        if (!product) {
            throw new AppError(404, "Không tìm thấy sản phẩm");
        }

        // Add rating stats
        const stats = await getReviewStats(productId);
        const productWithRating = {
            ...product.toJSON(),
            rating: {
                averageRating: stats.avgRating,
                totalReviews: stats.totalReviews
            }
        };

        return productWithRating;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("getPublicProductById service error:", error);
        throw new AppError(500, "Không thể lấy chi tiết sản phẩm");
    }
};


// ====================================================================
// SECTION: ADMIN SERVICES (Dành cho Trang Quản trị)
// ====================================================================

/**
 * Lấy danh sách sản phẩm cho admin (bao gồm cả inactive products)
 * @param {object} queryParams - Các tham số lọc { page, limit, search, categoryId }
 * @returns {Promise<object>} - Danh sách sản phẩm và thông tin phân trang
 */
const getAllAdminProducts = async (queryParams) => {
    try {
        const { page = 1, limit = 10, search, categoryId } = queryParams;
        const offset = (page - 1) * limit;

        // Build conditions array for AND operations
        const conditions = [];
        
        // Filter by categoryId if provided
        if (categoryId) {
            conditions.push({ categoryId });
        }
        
        // Filter by search if provided
        if (search) {
            conditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ]
            });
        }
        
        // Build final whereClause
        const whereClause = conditions.length > 0 
            ? (conditions.length === 1 ? conditions[0] : { [Op.and]: conditions })
            : {};
        
        console.log("getAllAdminProducts whereClause:", JSON.stringify(whereClause, null, 2));

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [
                { model: Category, as: "category", attributes: ['id', 'name'] },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true,
        });

        // Add rating stats to each product
        const productsWithRatings = await Promise.all(rows.map(async (product) => {
            const stats = await getReviewStats(product.id);
            return {
                ...product.toJSON(),
                rating: {
                    averageRating: stats.avgRating,
                    totalReviews: stats.totalReviews
                }
            };
        }));

        return {
            data: productsWithRatings,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit),
            },
        };
    } catch (error) {
        console.error("getAllAdminProducts service error details:", {
            message: error.message,
            code: error.code,
            original: error.original?.message,
            stack: error.stack
        });
        throw new AppError(500, "Không thể lấy danh sách sản phẩm");
    }
};

/**
 * Tạo một sản phẩm mới (Admin).
 * Sẽ tạo Product + một default ProductVariant
 * @param {object} productData - Dữ liệu sản phẩm từ request body.
 * @returns {Promise<Product>} - Sản phẩm vừa được tạo (kèm variant).
 */
const createProduct = async (productData) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            name,
            description,
            htmlDescription,
            specifications,
            usageGuide,
            categoryId,
            attributes,
            // ProductVariant fields:
            sku,
            price,
            costPrice,
            stockQuantity,
        } = productData;
        
        // Kiểm tra xem categoryId có hợp lệ không
        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new AppError(400, "Danh mục không hợp lệ");
        }

        // Step 1: Tạo Product
        const newProduct = await Product.create({
            name,
            description,
            htmlDescription,
            specifications,
            usageGuide,
            categoryId,
            attributes: attributes || null,
        }, { transaction });

        // Step 2: Tạo default ProductVariant
        const newVariant = await ProductVariant.create({
            productId: newProduct.id,
            sku: sku || `SKU-${newProduct.id}`,
            name: name,
            price: price || 0,
            costPrice: costPrice || 0,
            stockQuantity: parseInt(stockQuantity || 0),
            attributes: attributes || null,
            status: 'active',
        }, { transaction });

        await transaction.commit();

        // Fetch lại product kèm variant
        const productWithVariant = await Product.findByPk(newProduct.id, {
            attributes: ['id', 'name', 'description', 'htmlDescription', 'specifications', 'usageGuide', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [
                { model: Category, as: "category", attributes: ['id', 'name'] },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
            ]
        });

        return productWithVariant;
    } catch (error) {
        await transaction.rollback();
        if (error instanceof AppError) {
            throw error;
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError(409, "Mã SKU đã tồn tại");
        }
        console.error("createProduct service error:", error);
        throw new AppError(500, "Không thể tạo sản phẩm mới");
    }
};

/**
 * Cập nhật thông tin một sản phẩm (Admin).
 * Chỉ cập nhật các trường của Product, không cập nhật ProductVariant
 * @param {number} productId - ID của sản phẩm cần cập nhật.
 * @param {object} productData - Dữ liệu cần cập nhật (name, description, categoryId, attributes).
 * @returns {Promise<Product>} - Sản phẩm sau khi đã cập nhật.
 */
const updateProduct = async (productId, productData) => {
    try {
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [{ model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }]
        });
        if (!product) {
            throw new AppError(404, "Không tìm thấy sản phẩm để cập nhật");
        }

        // Nếu có cập nhật categoryId, kiểm tra tính hợp lệ
        if (productData.categoryId) {
            const category = await Category.findByPk(productData.categoryId);
            if (!category) {
                throw new AppError(400, "Danh mục không hợp lệ");
            }
        }

        // Chỉ cho phép cập nhật các trường của Product
        const allowedFields = ['name', 'description', 'htmlDescription', 'specifications', 'usageGuide', 'categoryId', 'attributes'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (productData.hasOwnProperty(field)) {
                updateData[field] = productData[field];
            }
        });

        const updatedProduct = await product.update(updateData);
        
        // Update ProductVariant nếu có các trường variant được truyền lên
        if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            const variantUpdateData = {};
            
            // Chỉ update nếu có giá trị được cung cấp
            if (productData.sku) variantUpdateData.sku = productData.sku;
            if (productData.price !== undefined) variantUpdateData.price = productData.price;
            if (productData.costPrice !== undefined) variantUpdateData.costPrice = productData.costPrice;
            if (productData.stockQuantity !== undefined) variantUpdateData.stockQuantity = parseInt(productData.stockQuantity);
            
            // Nếu có trường variant cần update
            if (Object.keys(variantUpdateData).length > 0) {
                await firstVariant.update(variantUpdateData);
            }
        }
        
        // Fetch lại product kèm variants
        const updatedProductWithVariants = await Product.findByPk(product.id, {
            attributes: ['id', 'name', 'description', 'htmlDescription', 'specifications', 'usageGuide', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [
                { model: Category, as: "category", attributes: ['id', 'name'] },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
            ]
        });
        return updatedProductWithVariants;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("updateProduct service error:", error);
        throw new AppError(500, "Không thể cập nhật sản phẩm");
    }
};

/**
 * Xóa một sản phẩm (Admin).
 * Sẽ xóa Product và tất cả ProductVariant liên quan (cascade).
 * @param {number} productId - ID của sản phẩm cần xóa.
 * @returns {Promise<void>}
 */
const deleteProduct = async (productId) => {
    try {
        const product = await Product.findByPk(productId, {
            attributes: ['id']
        });
        if (!product) {
            throw new AppError(404, "Không tìm thấy sản phẩm để xóa");
        }
        
        // Cascade delete sẽ tự động xóa ProductVariant liên quan
        await product.destroy();
        
        // Hàm không cần trả về gì, controller sẽ gửi status 204
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("deleteProduct service error:", error);
        throw new AppError(500, "Không thể xóa sản phẩm");
    }
};

/**
 * Cập nhật ảnh cho ProductVariant đầu tiên của sản phẩm.
 * @param {number} productId - ID của sản phẩm.
 * @param {string} newImageUrl - Đường dẫn URL mới của ảnh (từ multer upload).
 * @returns {Promise<Product>} - Sản phẩm sau khi đã cập nhật kèm variants.
 */
const updateProductImage = async (productId, newImageUrl) => {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("🎬 START: updateProductImage");
        console.log("=".repeat(60));
        console.log("[1] Input received:", { productId, newImageUrl });
        
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt']
        });
        console.log("[2] Product found:", { 
            id: product?.id, 
            name: product?.name,
            exists: !!product 
        });
        
        if (!product) {
            throw new AppError(404, "Không tìm thấy sản phẩm");
        }

        // ★ Check if this image URL already exists to avoid duplicates
        console.log("[3] Checking for existing image URL...");
        const existingImage = await ProductImage.findOne({
            where: {
                productId: product.id,
                productVariantId: null,
                imageUrl: newImageUrl
            }
        });
        console.log("[3] Existing image check result:", {
            found: !!existingImage,
            id: existingImage?.id
        });

        if (!existingImage) {
            console.log("[4] Creating NEW ProductImage record...");
            
            // ★ Check if this product already has images
            console.log("[4a] Checking if product has existing images...");
            const existingImages = await ProductImage.findAll({
                where: {
                    productId: product.id,
                    productVariantId: null
                }
            });
            
            const isFirstImage = existingImages.length === 0;
            console.log("[4a] Image count for this product:", existingImages.length, "Is first image:", isFirstImage);

            // ★ Only set as primary if this is the first image
            // For subsequent images, add them as non-primary
            console.log("[4b] Creating new ProductImage...");
            const productImage = await ProductImage.create({
                productId: product.id,
                productVariantId: null,
                imageUrl: newImageUrl,
                isPrimary: isFirstImage, // Only first image is primary
                displayOrder: isFirstImage ? 1 : (existingImages.length + 1)
            });
            console.log("[4b] ProductImage created successfully:", { 
                id: productImage.id, 
                imageUrl: productImage.imageUrl,
                isPrimary: productImage.isPrimary,
                displayOrder: productImage.displayOrder
            });
        } else {
            console.log("[4] Image URL already exists, skipping...");
            // Image already exists, no need to add it again
        }

        // ALSO update the first variant's image_url for backwards compatibility
        // Only update if this is the primary image
        console.log("[5] Checking if we need to update variant image_url...");
        const primaryImage = await ProductImage.findOne({
            where: {
                productId: product.id,
                productVariantId: null,
                isPrimary: true
            }
        });

        if (primaryImage) {
            const defaultVariant = await ProductVariant.findOne({
                where: { productId: product.id },
                order: [['id', 'ASC']]
            });

            if (defaultVariant) {
                await defaultVariant.update({ imageUrl: primaryImage.imageUrl });
                console.log("[5] Variant updated with primary image:", { 
                    variantId: defaultVariant.id,
                    imageUrl: primaryImage.imageUrl
                });
            }
        } else {
            console.log("[5] No primary image found, skipping variant update");
        }

        // ★ Return product WITH productImages
        console.log("[6] Fetching updated product...");
        
        try {
            // Fetch product with basic relations
            const updatedProduct = await Product.findByPk(product.id, {
                attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
                include: [
                    { model: Category, as: "category", attributes: ['id', 'name'] },
                    { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
                ]
            });

            if (!updatedProduct) {
                throw new AppError(404, "Không tìm thấy sản phẩm sau khi cập nhật");
            }

            // Fetch productImages separately to avoid query issues
            const productImages = await ProductImage.findAll({
                where: {
                    productId: product.id,
                    productVariantId: null
                },
                attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
                order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
            });

            console.log("[6] Product fetched successfully:", {
                id: updatedProduct.id,
                name: updatedProduct.name,
                productImagesCount: productImages.length,
                firstImage: productImages?.[0]?.imageUrl,
                variantCount: updatedProduct.variants?.length,
                firstVariantImageUrl: updatedProduct.variants?.[0]?.image_url
            });
            
            console.log("✅ END: updateProductImage - SUCCESS");
            console.log("=".repeat(60) + "\n");

            // ⭐ Convert to plain object and add productImages
            // (Adding to Sequelize instance directly may not serialize properly to JSON)
            const responseData = {
                ...updatedProduct.toJSON(),
                productImages: productImages
            };

            return responseData;
        } catch (fetchError) {
            console.error("❌ ERROR fetching updated product:", {
                message: fetchError.message,
                code: fetchError.code,
                sql: fetchError.sql,
                stack: fetchError.stack
            });
            throw fetchError;
        }
    } catch (error) {
        console.error("\n" + "=".repeat(60));
        console.error("❌ ERROR in updateProductImage");
        console.error("=".repeat(60));
        console.error({
            productId: productId,
            imageUrl: newImageUrl,
            message: error.message,
            code: error.code,
            sql: error.sql,
            originalError: error.original?.message,
            validationErrors: error.errors,
            isAppError: error instanceof AppError,
            statusCode: error.statusCode,
            parent: error.parent?.message,
            errno: error.errno,
            sqlState: error.sqlState
        });
        console.error("Full error:");
        console.error(error);
        console.error("=".repeat(60) + "\n");
        
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "Không thể cập nhật ảnh sản phẩm");
    }
};

/**
 * Xóa ảnh sản phẩm (Admin).
 * @param {number} productId - ID của sản phẩm.
 * @param {number} imageId - ID của ProductImage cần xóa.
 * @returns {Promise<Product>} - Sản phẩm sau khi xóa ảnh kèm danh sách ảnh còn lại.
 */
const deleteProductImage = async (productId, imageId) => {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("🗑️ START: deleteProductImage");
        console.log("=".repeat(60));
        console.log("[1] Input:", { productId, imageId, types: { productId: typeof productId, imageId: typeof imageId } });

        // Ensure numeric types
        const numProductId = Number(productId);
        const numImageId = Number(imageId);
        
        if (isNaN(numProductId) || isNaN(numImageId)) {
            throw new AppError(400, "ID sản phẩm và ID ảnh phải là số hợp lệ");
        }

        // Verify product exists
        const product = await Product.findByPk(numProductId, {
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt']
        });
        if (!product) {
            throw new AppError(404, "Không tìm thấy sản phẩm");
        }
        console.log("[2] Product found:", { id: product.id, name: product.name });

        // Find and verify product image belongs to this product
        const productImage = await ProductImage.findByPk(numImageId);
        console.log("[3a] Image lookup result:", { 
            imageId: numImageId,
            found: !!productImage,
            imageProductId: productImage?.productId,
            expectedProductId: numProductId,
            types: { imageProductId: typeof productImage?.productId, expectedProductId: typeof numProductId }
        });
        
        if (!productImage) {
            throw new AppError(404, "Ảnh không tồn tại");
        }
        
        if (productImage.productId !== numProductId) {
            throw new AppError(403, "Ảnh không thuộc sản phẩm này");
        }
        
        console.log("[3b] ProductImage verified:", { 
            id: productImage.id, 
            imageUrl: productImage.imageUrl,
            isPrimary: productImage.isPrimary,
            productId: productImage.productId
        });

        const isSingleImage = productImage.isPrimary;

        // Delete the image
        await productImage.destroy();
        console.log("[4] ProductImage deleted successfully");

        // If this was the primary image and there are other images, make the next one primary
        if (isSingleImage) {
            console.log("[5] This was primary image, checking for next image...");
            const nextImage = await ProductImage.findOne({
                where: {
                    productId: numProductId,
                    productVariantId: null,
                    id: { [Op.ne]: numImageId }
                },
                order: [['displayOrder', 'ASC']]
            });

            if (nextImage) {
                console.log("[5a] Setting next image as primary");
                await nextImage.update({ isPrimary: true, displayOrder: 1 });
                
                // Also update variant image_url for backwards compatibility
                const defaultVariant = await ProductVariant.findOne({
                    where: { productId: numProductId },
                    order: [['id', 'ASC']]
                });
                if (defaultVariant) {
                    await defaultVariant.update({ imageUrl: nextImage.imageUrl });
                    console.log("[5b] Variant image_url updated");
                }
            } else {
                console.log("[5] No more images for this product");
            }
        }

        // Fetch updated product with remaining images
        console.log("[6] Fetching updated product...");
        
        const updatedProduct = await Product.findByPk(numProductId, {
            attributes: ['id', 'name', 'description', 'categoryId', 'attributes', 'createdAt', 'updatedAt'],
            include: [
                { model: Category, as: "category", attributes: ['id', 'name'] },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'sku', 'name', 'price', 'cost_price', 'stock_quantity', 'image_url', 'status', 'attributes'] }
            ]
        });

        if (!updatedProduct) {
            throw new AppError(404, "Không tìm thấy sản phẩm sau khi xóa ảnh");
        }

        // Fetch productImages separately
        const productImages = await ProductImage.findAll({
            where: {
                productId: numProductId,
                productVariantId: null
            },
            attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
            order: [['isPrimary', 'DESC'], ['displayOrder', 'ASC']]
        });

        console.log("[6] Product fetched successfully:", {
            id: updatedProduct.id,
            productImagesCount: productImages.length,
            primaryImage: productImages?.find(img => img.isPrimary)?.imageUrl
        });

        console.log("✅ END: deleteProductImage - SUCCESS");
        console.log("=".repeat(60) + "\n");

        // ⭐ Convert to plain object and add productImages
        // (Adding to Sequelize instance directly may not serialize properly to JSON)
        const responseData = {
            ...updatedProduct.toJSON(),
            productImages: productImages
        };

        return responseData;
    } catch (error) {
        console.error("\n" + "=".repeat(60));
        console.error("❌ ERROR in deleteProductImage");
        console.error("=".repeat(60));
        console.error({
            productId: numProductId,
            imageId: numImageId,
            message: error.message,
            code: error.code,
            sql: error.sql,
            originalError: error.original?.message,
            validationErrors: error.errors,
            isAppError: error instanceof AppError,
            statusCode: error.statusCode,
            parent: error.parent?.message,
            errno: error.errno,
            sqlState: error.sqlState
        });
        console.error("Full error:");
        console.error(error);
        console.error("=".repeat(60) + "\n");

        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "Không thể xóa ảnh sản phẩm");
    }
};


// Export tất cả các hàm
module.exports = {
    // Public
    getPublicProducts,
    getPublicProductById,
    // Admin
    getAllAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImage,
    deleteProductImage,
};