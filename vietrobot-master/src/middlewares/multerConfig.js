const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../helpers/error');

/**
 * Hàm trợ giúp để đảm bảo một thư mục tồn tại.
 * Nếu thư mục không tồn tại, nó sẽ được tạo.
 * @param {string} dirPath - Đường dẫn đến thư mục.
 */
const ensureDirExists = (dirPath) => {
    // `recursive: true` cho phép tạo các thư mục cha nếu chúng chưa tồn tại.
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Tạo một cấu hình lưu trữ (storage engine) cho Multer.
 * @param {string} subfolder - Thư mục con bên trong `/src/uploads/` để lưu file.
 *                             Ví dụ: 'images/products'
 * @returns {multer.StorageEngine} - Một storage engine đã được cấu hình.
 */
const createStorage = (subfolder) => {
    return multer.diskStorage({
        // destination: xác định thư mục lưu trữ file
        destination: (req, file, cb) => {
            // Đường dẫn đầy đủ đến thư mục upload
            const uploadPath = path.join(__dirname, `../uploads/${subfolder}`);
            // Đảm bảo thư mục này tồn tại trước khi lưu file
            ensureDirExists(uploadPath);
            // Callback để thông báo cho multer nơi lưu file
            cb(null, uploadPath);
        },
        // filename: xác định tên file sẽ được lưu
        filename: (req, file, cb) => {
            // Tạo một tên file duy nhất để tránh trùng lặp
            // Cấu trúc: fieldname-timestamp-random.extension
            // Ví dụ: productImage-1678886400000-a1b2c3.jpg
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const newFilename = file.fieldname + '-' + uniqueSuffix + extension;
            cb(null, newFilename);
        }
    });
};

/**
 * Bộ lọc file (file filter) để chỉ cho phép các định dạng ảnh phổ biến.
 * @param {object} req - Đối tượng request.
 * @param {object} file - Đối tượng file được upload.
 * @param {function} cb - Callback function.
 */
const imageFileFilter = (req, file, cb) => {
    // Kiểm tra mimetype của file
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        // Chấp nhận file
        cb(null, true);
    } else {
        // Từ chối file với một lỗi cụ thể
        cb(new AppError(400, 'Định dạng file không được hỗ trợ. Chỉ chấp nhận file ảnh (jpeg, png, gif, webp).'), false);
    }
};

/**
 * Tạo một instance của Multer với các tùy chọn đã cấu hình.
 * @param {string} subfolder - Thư mục con để lưu file.
 * @param {number} fileSizeLimit - Giới hạn kích thước file (tính bằng byte).
 * @returns {multer} - Một middleware Multer.
 */
const createUploader = (subfolder, fileSizeLimit) => {
    return multer({
        storage: createStorage(subfolder),
        fileFilter: imageFileFilter,
        limits: {
            fileSize: fileSizeLimit // Giới hạn kích thước file
        }
    });
};

// --- Xuất ra các middleware đã được cấu hình sẵn cho từng trường hợp sử dụng ---

module.exports = {
    uploadProductImage: createUploader('images/products', 5 * 1024 * 1024), // 5MB
    uploadCategoryImage: createUploader('images/categories', 2 * 1024 * 1024), // 2MB
    uploadAvatar: createUploader('images/avatars', 2 * 1024 * 1024), // 2MB
};