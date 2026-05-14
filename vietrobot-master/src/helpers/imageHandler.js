const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('../helpers/error');

/**
 * Base64 Image Handler
 * Convert base64 to file and save to disk
 */

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/reviews');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Ensure uploads directory exists
 */
const ensureUploadDir = () => {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log(`✅ Created uploads directory: ${UPLOADS_DIR}`);
    }
};

/**
 * Parse base64 image and extract metadata
 * @param {string} base64String - Data URL or pure base64
 * @returns {object} - { mimeType, buffer, extension }
 */
const parseBase64Image = (base64String) => {
    try {
        let mimeType = 'image/jpeg';
        let base64Data = base64String;

        // Handle data URL format: data:image/png;base64,xxx
        if (base64String.startsWith('data:')) {
            const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Invalid base64 format');
            }
            mimeType = matches[1];
            base64Data = matches[2];
        }

        // Validate MIME type
        if (!ALLOWED_MIMES.includes(mimeType)) {
            throw new Error(`MIME type ${mimeType} not allowed. Allowed: ${ALLOWED_MIMES.join(', ')}`);
        }

        // Decode base64
        const buffer = Buffer.from(base64Data, 'base64');

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`File size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds max (5MB)`);
        }

        // Get file extension
        const extension = mimeType.split('/')[1] === 'svg+xml' ? 'svg' : mimeType.split('/')[1];

        return {
            mimeType,
            buffer,
            extension
        };
    } catch (error) {
        throw new AppError(400, `Invalid image format: ${error.message}`);
    }
};

/**
 * Save base64 image to disk
 * @param {string} base64String - Base64 image string
 * @param {string} prefix - filename prefix (e.g., 'review-123')
 * @returns {string} - Relative file path (/uploads/reviews/...)
 */
const saveBase64Image = (base64String, prefix = 'review') => {
    try {
        ensureUploadDir();

        const { buffer, extension } = parseBase64Image(base64String);

        // Generate unique filename
        const timestamp = Date.now();
        const random = crypto.randomBytes(4).toString('hex');
        const filename = `${prefix}-${timestamp}-${random}.${extension}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        // Write to disk
        fs.writeFileSync(filepath, buffer);

        console.log(`✅ Image saved: ${filename} (${(buffer.length / 1024).toFixed(2)}KB)`);

        // Return relative path for URLs
        return `/uploads/reviews/${filename}`;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('❌ Error saving base64 image:', error.message);
        throw new AppError(500, `Failed to save image: ${error.message}`);
    }
};

/**
 * Batch save multiple base64 images
 * @param {array} base64Strings - Array of base64 strings
 * @param {string} prefix - Filename prefix
 * @returns {array} - Array of relative file paths
 */
const saveBase64Images = (base64Strings, prefix = 'review') => {
    if (!Array.isArray(base64Strings)) {
        return [];
    }

    return base64Strings
        .filter(b64 => b64 && typeof b64 === 'string')
        .map((b64, index) => {
            try {
                return saveBase64Image(b64, `${prefix}-${index}`);
            } catch (error) {
                console.error(`Failed to save image ${index}:`, error.message);
                return null;
            }
        })
        .filter(path => path !== null);
};

/**
 * Delete image file
 * @param {string} imagePath - Relative path (/uploads/reviews/...)
 */
const deleteImage = (imagePath) => {
    try {
        if (!imagePath) return;

        const fullPath = path.join(__dirname, '../../public', imagePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`✅ Image deleted: ${imagePath}`);
        }
    } catch (error) {
        console.error('⚠️ Error deleting image:', error.message);
        // Don't throw - just warn
    }
};

/**
 * Check if URL is base64 or already saved
 * @param {string} url - URL string
 * @returns {boolean}
 */
const isBase64Image = (url) => {
    return typeof url === 'string' && url.startsWith('data:');
};

/**
 * Determine file type from URL
 * @param {string} url - URL or base64 string
 * @returns {string} - 'base64' | 'local' | 'external'
 */
const getImageType = (url) => {
    if (!url) return 'unknown';
    if (url.startsWith('data:')) return 'base64';
    if (url.startsWith('http')) return 'external';
    if (url.startsWith('/uploads')) return 'local';
    return 'unknown';
};

module.exports = {
    ensureUploadDir,
    parseBase64Image,
    saveBase64Image,
    saveBase64Images,
    deleteImage,
    isBase64Image,
    getImageType,
    UPLOADS_DIR,
    MAX_FILE_SIZE
};
