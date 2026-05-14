// controllers/admin/products.controller.js
const adminProductService = require("../../services/product.service");
const { response } = require("../../helpers/response");
const { AppError } = require("../../helpers/error");

const getAllProducts = async (req, res, next) => {
    try {
        const queryParams = req.query;
        const result = await adminProductService.getAllAdminProducts(queryParams);
        res.status(200).json(response(result));
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const productData = req.body;
        const newProduct = await adminProductService.createProduct(productData);
        res.status(201).json(response(newProduct));
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        const updatedProduct = await adminProductService.updateProduct(id, productData);
        res.status(200).json(response(updatedProduct));
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminProductService.deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const updateProductImage = async (req, res, next) => {
    try {
        // Middleware Multer sẽ đặt thông tin file vào req.file
        if (!req.file) {
            throw new AppError(400, "Vui lòng tải lên một file ảnh.");
        }

        const { id } = req.params;

        // Xây dựng đường dẫn URL có thể truy cập từ web cho ảnh
        // Dựa trên cấu hình static file trong index.js và cấu hình multerConfig.js
        const imageUrl = `/uploads/images/products/${req.file.filename}`;
        
        console.log("updateProductImage controller:", {
            productId: id,
            filename: req.file.filename,
            imageUrl: imageUrl,
            fileSize: req.file.size,
            mimetype: req.file.mimetype
        });

        const updatedProduct = await adminProductService.updateProductImage(id, imageUrl);
        
        console.log("updateProductImage response - variants:", {
            productId: updatedProduct.id,
            variantCount: updatedProduct.variants?.length,
            productImagesCount: updatedProduct.productImages?.length,
            firstVariantImageUrl: updatedProduct.variants?.[0]?.image_url
        });

        res.status(200).json(response(updatedProduct));
    } catch (error) {
        console.error("❌ updateProductImage controller error:", {
            productId: req.params.id,
            filename: req.file?.filename,
            message: error.message,
            code: error.code,
            sql: error.sql,
            statusCode: error.statusCode,
            stack: error.stack
        });
        next(error);
    }
};

const deleteProductImage = async (req, res, next) => {
    try {
        // Convert params to numbers (params are strings by default)
        const productId = parseInt(req.params.id, 10);
        const imageId = parseInt(req.params.imageId, 10);
        
        console.log("🗑️ deleteProductImage controller called:", { productId, imageId, types: { productId: typeof productId, imageId: typeof imageId } });
        
        if (!productId || !imageId || isNaN(productId) || isNaN(imageId)) {
            console.log("❌ Invalid params:", { productId, imageId });
            throw new AppError(400, "ID sản phẩm và ID ảnh phải là số hợp lệ");
        }

        console.log("Calling service...");
        const result = await adminProductService.deleteProductImage(productId, imageId);
        
        console.log("✅ Service returned:", {
            productId: result.id,
            imagesCount: result.productImages?.length
        });
        
        res.status(200).json(response(result));
    } catch (error) {
        console.error("❌ deleteProductImage controller error:", error.message);
        next(error);
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImage,
    deleteProductImage,
};