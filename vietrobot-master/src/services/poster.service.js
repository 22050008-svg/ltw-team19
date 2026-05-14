// services/poster.service.js
const { CategoryPoster, Category, User } = require("../models");
const { AppError } = require("../helpers/error");
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// ========== GET POSTERS ==========
/**
 * Lấy danh sách poster của một danh mục
 */
const getPostersByCategory = async (categoryId, options = {}) => {
    try {
        const { limit = 10, offset = 0, isActive = true } = options;

        const whereClause = { categoryId };
        if (isActive !== null) {
            whereClause.isActive = isActive;
        }

        const { count, rows } = await CategoryPoster.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
            ],
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            data: rows,
            pagination: {
                total: count,
                limit,
                offset,
                pages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        console.error("getPostersByCategory error:", error);
        throw new AppError(500, "Không thể lấy danh sách poster");
    }
};

/**
 * Lấy danh sách poster theo vị trí (homepage hoặc category)
 */
const getPostersByLocation = async (location, options = {}) => {
    try {
        const { limit = 10, offset = 0, isActive = true } = options;

        const whereClause = { location };
        if (isActive !== null) {
            whereClause.isActive = isActive;
        }

        const { count, rows } = await CategoryPoster.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
            ],
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            data: rows,
            pagination: {
                total: count,
                limit,
                offset,
                pages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        console.error("getPostersByLocation error:", error);
        throw new AppError(500, "Không thể lấy danh sách poster theo vị trí");
    }
};

/**
 * Lấy một poster theo ID
 */
const getPosterById = async (posterId) => {
    try {
        const poster = await CategoryPoster.findByPk(posterId, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
            ]
        });

        if (!poster) {
            throw new AppError(404, "Poster không tồn tại");
        }

        return poster;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("getPosterById error:", error);
        throw new AppError(500, "Không thể lấy chi tiết poster");
    }
};

// ========== CREATE POSTER ==========
/**
 * Tạo mới poster
 */
const createPoster = async (posterData, userId) => {
    try {
        const { categoryId, imageUrl, title, description, displayOrder, location = 'category', redirectUrl } = posterData;

        // Nếu location là category, categoryId bắt buộc và danh mục phải tồn tại
        if (location === 'category') {
            if (!categoryId) {
                throw new AppError(400, "categoryId bắt buộc khi location là 'category'");
            }
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new AppError(404, "Danh mục không tồn tại");
            }
        }

        const poster = await CategoryPoster.create({
            categoryId: location === 'homepage' ? null : categoryId,
            imageUrl,
            title: title || (location === 'homepage' ? 'Poster Trang Chủ' : 'Poster Danh Mục'),
            description,
            displayOrder: displayOrder || 0,
            isActive: true,
            location: location,
            redirectUrl: redirectUrl || null,
            createdBy: userId
        });

        return await getPosterById(poster.id);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("createPoster error:", error);
        throw new AppError(500, "Không thể tạo poster");
    }
};

// ========== UPDATE POSTER ==========
/**
 * Cập nhật poster
 */
const updatePoster = async (posterId, updateData, userId) => {
    try {
        const poster = await CategoryPoster.findByPk(posterId);
        if (!poster) {
            throw new AppError(404, "Poster không tồn tại");
        }

        // ★ UPDATED: Thêm redirectUrl vào allowedFields
        const allowedFields = ['title', 'description', 'displayOrder', 'isActive', 'imageUrl', 'location', 'categoryId', 'redirectUrl'];
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                // Nếu cập nhật location hoặc categoryId, cần kiểm tra logic
                if (field === 'location' && !['homepage', 'category'].includes(updateData[field])) {
                    throw new AppError(400, "location không hợp lệ");
                }
                if (field === 'categoryId' && updateData[field] !== null) {
                    const category = await Category.findByPk(updateData[field]);
                    if (!category) {
                        throw new AppError(404, "Danh mục không tồn tại");
                    }
                }
                poster[field] = updateData[field];
            }
        }

        await poster.save();
        return await getPosterById(posterId);
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("updatePoster error:", error);
        throw new AppError(500, "Không thể cập nhật poster");
    }
};

// ========== DELETE POSTER ==========
/**
 * Xóa poster
 */
const deletePoster = async (posterId) => {
    try {
        console.log(`[SERVICE] 🔍 Looking for poster ID: ${posterId}`);
        const poster = await CategoryPoster.findByPk(posterId);
        
        if (!poster) {
            console.log(`[SERVICE] ❌ Poster not found - ID: ${posterId}`);
            throw new AppError(404, "Poster không tồn tại");
        }

        console.log(`[SERVICE] ✓ Poster found: "${poster.title}" - Image: ${poster.imageUrl}`);

        // Xóa file hình ảnh từ server nếu cần
        if (poster.imageUrl && poster.imageUrl.startsWith('/uploads/')) {
            try {
                const filePath = path.join(process.cwd(), 'public', poster.imageUrl);
                console.log(`[SERVICE] 📁 Deleting image file: ${filePath}`);
                await fs.unlink(filePath);
                console.log(`[SERVICE] ✓ Image file deleted`);
            } catch (err) {
                console.warn(`[SERVICE] ⚠️  Could not delete image file:`, err.message);
            }
        } else {
            console.log(`[SERVICE] ℹ️  No image file to delete or invalid path: ${poster.imageUrl}`);
        }

        console.log(`[SERVICE] 🗑️  Destroying poster record from database...`);
        await poster.destroy();
        console.log(`[SERVICE] ✅ Poster deleted successfully from DB`);
        
        return { message: "Xóa poster thành công" };
    } catch (error) {
        if (error instanceof AppError) {
            console.log(`[SERVICE] ⚠️  AppError:`, error.message);
            throw error;
        }
        console.error(`[SERVICE] ❌ Unexpected error in deletePoster:`, error.message, error);
        throw new AppError(500, "Không thể xóa poster");
    }
};

// ========== UPLOAD IMAGE ==========
/**
 * Xử lý upload hình ảnh poster
 */
const handlePosterImageUpload = async (file) => {
    try {
        if (!file) {
            throw new AppError(400, "Vui lòng chọn tệp hình ảnh");
        }

        // Kiểm tra loại file
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new AppError(400, "Chỉ chấp nhận các file hình ảnh (JPEG, PNG, GIF, WebP)");
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new AppError(400, "Kích thước file không được vượt quá 5MB");
        }

        // Tạo tên file unique
        const ext = path.extname(file.originalname);
        const filename = `poster-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posters');

        // Tạo thư mục nếu chưa tồn tại
        await fs.mkdir(uploadDir, { recursive: true });

        // Lưu file
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, file.buffer);

        // Trả về đường dẫn URL
        const imageUrl = `/uploads/posters/${filename}`;
        return imageUrl;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("handlePosterImageUpload error:", error);
        throw new AppError(500, "Lỗi khi tải lên hình ảnh");
    }
};

// ========== REORDER POSTERS ==========
/**
 * Sắp xếp lại thứ tự poster
 */
const reorderPosters = async (categoryId, posterOrder) => {
    try {
        // posterOrder: [{ id, displayOrder }, ...]
        
        for (const item of posterOrder) {
            const poster = await CategoryPoster.findByPk(item.id);
            if (!poster || poster.categoryId !== parseInt(categoryId)) {
                throw new AppError(400, "Poster không hợp lệ");
            }
            poster.displayOrder = item.displayOrder;
            await poster.save();
        }

        return { message: "Cập nhật thứ tự thành công" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("reorderPosters error:", error);
        throw new AppError(500, "Không thể cập nhật thứ tự");
    }
};

module.exports = {
    getPostersByCategory,
    getPostersByLocation,
    getPosterById,
    createPoster,
    updatePoster,
    deletePoster,
    handlePosterImageUpload,
    reorderPosters
};
