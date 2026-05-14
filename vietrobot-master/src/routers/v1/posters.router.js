// src/routers/v1/posters.router.js
/**
 * PUBLIC POSTER ROUTES
 * These endpoints are public - no authentication required
 * Used for displaying posters on homepage and category pages
 */

const express = require('express');
const router = express.Router();
const postersController = require('../../controllers/posters.controller');

// Path: /api/v1/posters

/**
 * GET /api/v1/posters/location/:location
 * Lấy danh sách poster theo vị trí (homepage hoặc category)
 * Public endpoint - không cần đăng nhập
 */
router.get('/location/:location', postersController.getPostersByLocation);

/**
 * GET /api/v1/posters/category/:categoryId
 * Lấy danh sách poster của danh mục
 * Public endpoint - không cần đăng nhập
 */
router.get('/category/:categoryId', postersController.getPostersByCategory);

/**
 * GET /api/v1/posters/:posterId
 * Lấy chi tiết một poster
 * Public endpoint - không cần đăng nhập
 */
router.get('/:posterId', postersController.getPosterById);

module.exports = router;
