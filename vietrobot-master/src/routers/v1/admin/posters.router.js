// routers/v1/admin/posters.router.js
const express = require('express');
const router = express.Router();
const { checkPermission } = require('../../../middlewares/permission.middleware');
const multer = require('multer');
const postersController = require('../../../controllers/admin/posters.controller');

// Upload middleware
const upload = multer({ storage: multer.memoryStorage() });

// ========== SPECIFIC ROUTES FIRST (MUST come before generic :id routes) ==========

/**
 * POST /admin/posters/upload
 * Upload hình ảnh poster
 */
router.post('/upload', checkPermission('poster.create'), upload.single('image'), postersController.uploadPosterImage);

/**
 * GET /admin/posters/location/:location
 * Lấy danh sách poster theo vị trí (homepage hoặc category)
 */
router.get('/location/:location', checkPermission('poster.read'), postersController.getPostersByLocation);

/**
 * GET /admin/posters/category/:categoryId
 * Lấy danh sách poster của danh mục
 */
router.get('/category/:categoryId', checkPermission('poster.read'), postersController.getPostersByCategory);

/**
 * PUT /admin/posters/category/:categoryId/reorder
 * Sắp xếp lại thứ tự poster
 */
router.put('/category/:categoryId/reorder', checkPermission('poster.update'), postersController.reorderPosters);

// ========== GENERIC ROUTES (MUST come after specific routes) ==========

/**
 * GET /admin/posters/:posterId
 * Lấy chi tiết một poster
 */
router.get('/:posterId', checkPermission('poster.read'), postersController.getPosterById);

/**
 * POST /admin/posters
 * Tạo mới poster
 */
router.post('/', checkPermission('poster.create'), postersController.createPoster);

/**
 * PUT /admin/posters/:posterId
 * Cập nhật poster
 */
router.put('/:posterId', checkPermission('poster.update'), postersController.updatePoster);

/**
 * DELETE /admin/posters/:posterId
 * Xóa poster
 */
router.delete('/:posterId', checkPermission('poster.delete'), postersController.deletePoster);

module.exports = router;
