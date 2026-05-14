// Nạp các biến môi trường từ file .env
require('dotenv').config();

const express = require("express");
const cors = require('cors');
const { createServer } = require('http');
const path = require('path');
const xlsx = require('xlsx');
const { sequelize, Product } = require("./models"); // Thêm Product
const { AppError, handleErrors } = require("./helpers/error");
const { initSocket } = require('./services/socket'); // Import socket handler


// Khởi tạo ứng dụng Express
const app = express();
const httpServer = createServer(app); // Tạo http server từ express app

// Khởi tạo Socket.IO và truyền http server vào
// Thao tác này sẽ gắn Socket.IO vào cùng server với Express
initSocket(httpServer);


// --- KÍCH HOẠT CORS TRƯỚC TIÊN ---
// PHẢI gọi TRƯỚC router để middleware hoạt động đúng
// Gọi cors() không có tùy chọn sẽ mặc định cho phép TẤT CẢ các domain truy cập.
// Nó sẽ tự động thêm header `Access-Control-Allow-Origin: *` vào tất cả các response.
app.use(cors());

// --- Middlewares ---
// Middleware để parse JSON request body
// Increase limit to support base64 images (default 100kb, increased to 10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ⭐ IMPORTANT: Avatar images from src/uploads MUST be registered FIRST
// Because they match /uploads/images/... path which is more specific
// Avatar: /uploads/images/avatars/avatar-xxx.jpg
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// Middleware để phục vụ các file tĩnh từ public folder (posters, reviews, etc)
// Suppress 404 errors for missing static files - only log errors
app.use(express.static("public", {
  onError: (err, req, res) => {
    // Suppress harmless 404 errors for favicon, robots.txt, etc
    if (!req.path.startsWith('/api')) {
      const harmlessFiles = ['/favicon.ico', '/robots.txt', '/.well-known'];
      const isHarmless = harmlessFiles.some(file => req.path.includes(file));
      if (!isHarmless && err.status !== 404) {
        console.error(`[STATIC] Error serving file: ${req.path}`, err);
      }
    }
  }
}));

// Serve poster and review images from public/uploads
// Poster: /uploads/posters/poster-xxx.jpg
// Review: /uploads/reviews/review-xxx.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
  onError: (err, req, res) => {
    if (process.env.DEBUG_IMAGES) {
      console.log(`[UPLOADS] Request for ${req.path} → served from public/uploads`);
    }
  }
}));

// ★ Initialize upload directories for review images
const { ensureUploadDir } = require('./helpers/imageHandler');
ensureUploadDir();
console.log('✅ Review images upload directory initialized');


// --- Kết nối Database ---
(async () => {
    try {
        // Bước 1: Luôn xác thực kết nối trước để đảm bảo thông tin credential là chính xác.
        await sequelize.authenticate();
        console.log("Connection to the database has been established successfully.");

        // Bước 2: Đồng bộ hóa models với database (chỉ tạo bảng nếu không tồn tại).
        // Use { alter: false } to avoid recreating too many indexes which exceeds MySQL 64-key limit
        await sequelize.sync({ alter: false });
        console.log("All models were synchronized successfully.");

    } catch (error) {
        console.error("Unable to connect to the database or sync models:", error);
        // Thoát khỏi tiến trình nếu không kết nối được DB
        process.exit(1); 
    }
})();


// --- Routers ---
// Import router V1
const v1Router = require("./routers/v1");
// Gắn router v1 vào đường dẫn /api/v1
app.use("/api/v1", v1Router);

// --- Xử lý lỗi (Error Handling) ---

// Route demo để kiểm tra AppError
app.get("/error", (req, res, next) => {
    // Lỗi sẽ được bắt bởi middleware handleErrors bên dưới
    throw new AppError(500, "Internal Server Error");
});


// Middleware bắt các request không khớp với bất kỳ route nào -> 404 Not Found
app.use((req, res, next) => {
    next(new AppError(404, "Not Found"));
});
// Middleware xử lý lỗi tập trung.
// PHẢI được đặt ở cuối cùng, sau tất cả các routers và middlewares khác.
app.use(handleErrors);

/**
 * Script chạy một lần để cập nhật htmlDescription cho sản phẩm từ file Excel.
 * File Excel 'hi_updated.xlsx' cần được đặt ở thư mục gốc của dự án.
 */
const updateProductsFromExcel = async () => {
    const fileName = 'hi_updated.xlsx';
    console.log(`[SCRIPT] Bắt đầu cập nhật mô tả HTML cho sản phẩm từ file ${fileName}...`);

    try {
        const filePath = path.join(process.cwd(), fileName);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(worksheet);

        if (excelData.length === 0) {
            console.error("[SCRIPT] Lỗi: File Excel trống hoặc không đúng định dạng.");
            return;
        }

        const firstRow = excelData[0];
        if (!firstRow.hasOwnProperty('MA_MAU_MA') || !firstRow.hasOwnProperty('HTML')) {
            console.error("[SCRIPT] Lỗi: File Excel phải có 2 cột 'MA_MAU_MA' và 'HTML'.");
            return;
        }

        // Bước 1: Lấy toàn bộ sản phẩm từ DB và chuẩn hóa SKU bằng cách xóa tất cả khoảng trắng
        console.log('[SCRIPT] Đang lấy danh sách sản phẩm từ cơ sở dữ liệu...');
        const allProducts = await Product.findAll({
            attributes: [
                'id',
                [sequelize.fn('REPLACE', sequelize.col('sku'), ' ', ''), 'sku']
            ],
            raw: true,
        });

        // Bước 2: Tạo Map để tra cứu nhanh từ SKU đã chuẩn hóa -> ID
        const productSkuMap = new Map();
        allProducts.forEach(p => {
            if (p.sku) {
                productSkuMap.set(p.sku, p.id);
            }
        });
        console.log(`[SCRIPT] Đã tải ${productSkuMap.size} sản phẩm vào bộ nhớ.`);

        let updatedCount = 0;
        const notFoundSkus = [];
        const updatePromises = [];

        // Bước 3: Lặp qua dữ liệu Excel, chuẩn hóa SKU và so sánh
        for (const row of excelData) {
            const excelSku = row.MA_MAU_MA;
            const htmlDescription = row.HTML || '';

            if (!excelSku) continue;

            // Chuẩn hóa SKU từ Excel bằng cách xóa tất cả khoảng trắng
            const standardizedSku = String(excelSku).replace(/\s/g, '');
            const productId = productSkuMap.get(standardizedSku);
            
            if (productId) {
                // Thêm promise cập nhật vào danh sách để thực thi đồng thời
                const updatePromise = Product.update(
                    { htmlDescription },
                    { where: { id: productId } }
                ).then(([affectedRows]) => {
                    if (affectedRows > 0) updatedCount++;
                });
                updatePromises.push(updatePromise);
            } else {
                notFoundSkus.push({ original: excelSku, standardized: standardizedSku });
            }
        }

        // Bước 4: Thực thi tất cả các promise cập nhật cùng lúc
        console.log(`[SCRIPT] Đang thực hiện ${updatePromises.length} cập nhật...`);
        await Promise.all(updatePromises);

        console.log("\n--- [SCRIPT] Báo cáo cập nhật ---");
        console.log(`- Tổng số dòng trong file Excel: ${excelData.length}`);
        console.log(`- Số sản phẩm được cập nhật thành công: ${updatedCount}`);
        console.log(`- Số SKU không tìm thấy trong database: ${notFoundSkus.length}`);
        if (notFoundSkus.length > 0) {
            console.log("- Danh sách SKU không tìm thấy (gốc -> đã chuẩn hóa):");
            notFoundSkus.forEach(item => {
                console.log(`  '${item.original}' -> '${item.standardized}'`);
            });
        }
        console.log("--- [SCRIPT] Cập nhật hoàn tất ---\n");

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`[SCRIPT] Lỗi: Không tìm thấy file: ${fileName}. Vui lòng đặt file ở thư mục gốc của dự án.`);
        } else {
            console.error("[SCRIPT] Đã có lỗi không mong muốn xảy ra:", error);
        }
    }
};

// sequelize.sync({ alter: true }) // force: true `alter: true` sẽ cập nhật bảng nếu có thay đổi model
//   .then(() => {
//     console.log("Database synchronized successfully!");
    

//   })
//   .catch((err) => {
//     console.error("Error synchronizing database:", err);
//   });

// --- Khởi động Server ---
// Lấy port từ biến môi trường, nếu không có thì mặc định là 4000
const PORT = process.env.PORT || 3306;
httpServer.listen(PORT, () => { // Sử dụng httpServer để lắng nghe
    console.log(`Server is running on port ${PORT}`);
});