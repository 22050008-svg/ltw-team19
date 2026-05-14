/**
 * Migration 025: Seed real products for 4 main categories
 * Categories: Tủ Lạnh (1), Máy Giặt (2), Máy Sấy (3), Máy Lạnh (4)
 *
 * Usage:
 *   node src/migrations/025-seed-products.js
 *
 * Safe to re-run: skips insertion if products already exist for these categories.
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'shop',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'thienthuan',
    {
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        logging: false,
    }
);

// ============================================================
// PRODUCT DATA
// ============================================================
const productsData = [

    // ===== TỦ LẠNH (category_id = 1) =====
    {
        name: 'Tủ lạnh Samsung Inverter 208L RT20HAR8DBU/SV',
        description: 'Tủ lạnh Samsung 2 cánh ngăn đá trên 208 lít, công nghệ Digital Inverter tiết kiệm điện, làm lạnh đa luồng SpaceMax tăng dung tích chứa, phù hợp gia đình 2-3 người.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'RT20HAR8DBU/SV' },
            { label: 'Loại tủ', value: '2 cánh ngăn đá trên' },
            { label: 'Dung tích tổng', value: '208 lít' },
            { label: 'Dung tích ngăn lạnh', value: '157 lít' },
            { label: 'Dung tích ngăn đá', value: '51 lít' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Digital Inverter' },
            { label: 'Tiêu thụ điện', value: '33 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Nhiệt độ ngăn lạnh khuyến nghị: 3°C. Nhiệt độ ngăn đá: -18°C. Vệ sinh tủ định kỳ 3-6 tháng/lần. Đặt tủ cách tường ít nhất 5cm.',
        sku: 'SAMSUNG-RT20HAR8DBU-SV',
        price: 7020000,
        variant_name: 'Samsung RT20HAR8DBU/SV - 208L',
        variant_attributes: {
            'Loại Tủ': '2 cánh',
            'Dung Tích': '208 lít',
            'Thương Hiệu': 'Samsung',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 28,
    },
    {
        name: 'Tủ lạnh Samsung Bespoke Inverter 382L RT38CG6584B1SV',
        description: 'Tủ lạnh Samsung Bespoke 2 cánh ngăn đá dưới 382 lít, công nghệ SpaceMax tăng không gian chứa đồ, All-Around Cooling làm lạnh đồng đều mọi góc tủ, Digital Inverter bền bỉ 20 năm.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'RT38CG6584B1SV' },
            { label: 'Loại tủ', value: '2 cánh ngăn đá dưới' },
            { label: 'Dung tích tổng', value: '382 lít' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Digital Inverter' },
            { label: 'Tiêu thụ điện', value: '47 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Đặt tủ cách tường ít nhất 5cm. Không để thực phẩm nóng vào tủ. Vệ sinh gioăng cửa tủ định kỳ 3 tháng/lần.',
        sku: 'SAMSUNG-RT38CG6584B1SV',
        price: 12400000,
        variant_name: 'Samsung RT38CG6584B1SV - 382L',
        variant_attributes: {
            'Loại Tủ': '2 cánh',
            'Dung Tích': '382 lít',
            'Thương Hiệu': 'Samsung',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 15,
    },
    {
        name: 'Tủ lạnh LG Inverter 374L ngăn đá dưới LTD37BLM',
        description: 'Tủ lạnh LG ngăn đá dưới 374 lít, công nghệ DoorCooling+ làm lạnh nhanh từ cánh cửa, Linear Cooling duy trì nhiệt độ ổn định ±0.5°C, bảo quản thực phẩm tươi ngon lâu hơn đến 7 ngày.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'LTD37BLM' },
            { label: 'Loại tủ', value: 'Ngăn đá dưới' },
            { label: 'Dung tích tổng', value: '374 lít' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Linear Inverter' },
            { label: 'Tiêu thụ điện', value: '51 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Ngăn đá dưới tiện lợi cho việc lấy thực phẩm đông lạnh. Nên xả đá 1-2 lần/năm nếu bám tuyết nhiều.',
        sku: 'LG-LTD37BLM',
        price: 12220000,
        variant_name: 'LG LTD37BLM - 374L',
        variant_attributes: {
            'Loại Tủ': 'Ngăn đá dưới',
            'Dung Tích': '374 lít',
            'Thương Hiệu': 'LG',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 20,
    },
    {
        name: 'Tủ lạnh LG Inverter 519L Side By Side GR-B256BL',
        description: 'Tủ lạnh LG Side By Side 519 lít, thiết kế 2 cánh mở sang hai bên, ngăn lạnh bên phải - ngăn đá bên trái, máy làm đá tự động, ngăn chứa đồ uống Door-in-Door tiện lợi.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'GR-B256BL' },
            { label: 'Loại tủ', value: 'Side By Side' },
            { label: 'Dung tích tổng', value: '519 lít' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Linear Inverter' },
            { label: 'Tiêu thụ điện', value: '66 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Hàn Quốc' },
        ],
        usage_guide: 'Side By Side phù hợp gia đình đông người. Thường xuyên vệ sinh lọc nước (nếu có) theo hướng dẫn nhà sản xuất.',
        sku: 'LG-GR-B256BL',
        price: 15410000,
        variant_name: 'LG GR-B256BL - 519L Side By Side',
        variant_attributes: {
            'Loại Tủ': 'Side By Side',
            'Dung Tích': '519 lít',
            'Thương Hiệu': 'LG',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Hàn Quốc'
        },
        stock: 10,
    },
    {
        name: 'Tủ lạnh Toshiba Inverter 460L Side By Side GR-RS600WI',
        description: 'Tủ lạnh Toshiba Side By Side 460 lít, hệ thống làm lạnh kép độc lập cho ngăn lạnh và ngăn đá, bộ lọc nano bạc khử khuẩn và khử mùi hiệu quả, nhiều không gian bảo quản linh hoạt.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Toshiba' },
            { label: 'Model', value: 'GR-RS600WI-PMV(37)-SG' },
            { label: 'Loại tủ', value: 'Side By Side' },
            { label: 'Dung tích tổng', value: '460 lít' },
            { label: 'Màu sắc', value: 'Bạc' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Tiêu thụ điện', value: '51 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Tránh mở cửa tủ quá lâu. Kiểm tra và vệ sinh dàn nóng phía sau tủ 6 tháng/lần.',
        sku: 'TOSHIBA-GR-RS600WI',
        price: 12760000,
        variant_name: 'Toshiba GR-RS600WI - 460L Side By Side',
        variant_attributes: {
            'Loại Tủ': 'Side By Side',
            'Dung Tích': '460 lít',
            'Thương Hiệu': 'Toshiba',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 12,
    },
    {
        name: 'Tủ lạnh Toshiba Inverter 474L Multi Door GR-RF611WI',
        description: 'Tủ lạnh Toshiba Multi Door 474 lít mặt kính cường lực cao cấp màu đen sang trọng, ngăn đá dưới rộng rãi, công nghệ Hybrid Air System tạo môi trường bảo quản lý tưởng.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Toshiba' },
            { label: 'Model', value: 'GR-RF611WI-PGV(22)-XK' },
            { label: 'Loại tủ', value: 'Multi Door' },
            { label: 'Dung tích tổng', value: '474 lít' },
            { label: 'Chất liệu cửa', value: 'Kính cường lực' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Tiêu thụ điện', value: '57 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Mặt kính cần vệ sinh nhẹ nhàng bằng vải mềm, tránh dùng chất tẩy mạnh hoặc vật cứng gây xước.',
        sku: 'TOSHIBA-GR-RF611WI',
        price: 16290000,
        variant_name: 'Toshiba GR-RF611WI - 474L Multi Door',
        variant_attributes: {
            'Loại Tủ': 'Multi Door',
            'Dung Tích': '474 lít',
            'Thương Hiệu': 'Toshiba',
            'Chất Liệu Cửa': 'Kính',
            'Công Nghệ Inverter': 'Có',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 8,
    },
    {
        name: 'Tủ lạnh Panasonic Inverter 495L Multi Door NR-CW530XMMV',
        description: 'Tủ lạnh Panasonic Multi Door 495 lít mặt gương sang trọng, ngăn Prime Fresh 0°C bảo quản thịt cá tươi ngon đến 3 ngày không cần đông đá, công nghệ Econavi + Inverter thông minh tiết kiệm điện.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Panasonic' },
            { label: 'Model', value: 'NR-CW530XMMV' },
            { label: 'Loại tủ', value: 'Multi Door' },
            { label: 'Dung tích tổng', value: '495 lít' },
            { label: 'Chất liệu cửa', value: 'Gương' },
            { label: 'Màu sắc', value: 'Bạc gương' },
            { label: 'Công nghệ', value: 'Inverter + Econavi' },
            { label: 'Tiêu thụ điện', value: '48 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Ngăn Prime Fresh 0°C thích hợp bảo quản thịt cá tươi. Không để trực tiếp ánh nắng chiếu vào mặt gương để tránh bạc màu.',
        sku: 'PANASONIC-NR-CW530XMMV',
        price: 31820000,
        variant_name: 'Panasonic NR-CW530XMMV - 495L',
        variant_attributes: {
            'Loại Tủ': 'Multi Door',
            'Dung Tích': '495 lít',
            'Thương Hiệu': 'Panasonic',
            'Chất Liệu Cửa': 'Gương',
            'Công Nghệ Inverter': 'Có',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 5,
    },
    {
        name: 'Tủ lạnh Aqua Inverter 260L 2 cánh AQR-B310MA(FB)',
        description: 'Tủ lạnh Aqua 2 cánh ngăn đá trên 260 lít, thiết kế nhỏ gọn phù hợp gia đình 3-4 người, công nghệ làm lạnh đa chiều, tiết kiệm điện năng, ngăn rau củ quả giữ tươi lâu.',
        category_id: 1,
        specifications: [
            { label: 'Thương hiệu', value: 'Aqua' },
            { label: 'Model', value: 'AQR-B310MA(FB)' },
            { label: 'Loại tủ', value: '2 cánh ngăn đá trên' },
            { label: 'Dung tích tổng', value: '260 lít' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Tiêu thụ điện', value: '31 kWh/tháng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Để tủ nơi thoáng mát, cách tường ít nhất 10cm phía sau và 5cm hai bên để đảm bảo thông gió tốt.',
        sku: 'AQUA-AQR-B310MA-FB',
        price: 8620000,
        variant_name: 'Aqua AQR-B310MA(FB) - 260L',
        variant_attributes: {
            'Loại Tủ': '2 cánh',
            'Dung Tích': '260 lít',
            'Thương Hiệu': 'Aqua',
            'Công Nghệ Inverter': 'Có',
            'Số cánh cửa': '2 cánh',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 22,
    },

    // ===== MÁY GIẶT (category_id = 2) =====
    {
        name: 'Máy giặt Aqua 11kg cửa trên AQW-FR110JT BK',
        description: 'Máy giặt Aqua cửa trên 11kg, động cơ Direct Drive tiết kiệm điện nước, chức năng giặt nhanh 15 phút, bộ lọc xơ vải thông minh tự làm sạch, thiết kế hiện đại màu đen sang trọng.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Aqua' },
            { label: 'Model', value: 'AQW-FR110JT BK' },
            { label: 'Loại máy', value: 'Cửa trên' },
            { label: 'Khối lượng giặt', value: '11 kg' },
            { label: 'Tốc độ vắt', value: '750 vòng/phút' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Không giặt quá tải. Dùng bột giặt chuyên dụng cho máy giặt. Vệ sinh lồng giặt hàng tháng bằng chế độ tự làm sạch.',
        sku: 'AQUA-AQW-FR110JT-BK',
        price: 6190000,
        variant_name: 'Aqua AQW-FR110JT BK - 11kg cửa trên',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trên',
            'Khối Lượng Đồ Giặt': '11 kg',
            'Tốc Độ Vắt': '750 vòng/phút',
            'Thương Hiệu': 'Aqua',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 18,
    },
    {
        name: 'Máy giặt Samsung Inverter 9.5kg cửa trên WA95CG4545BDSV',
        description: 'Máy giặt Samsung cửa trên 9.5kg, công nghệ Digital Inverter tiết kiệm điện, chức năng Magic Dispenser tự động xả bột giặt đúng thời điểm, Hygiene Steam khử khuẩn 99.9%.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'WA95CG4545BDSV' },
            { label: 'Loại máy', value: 'Cửa trên' },
            { label: 'Khối lượng giặt', value: '9.5 kg' },
            { label: 'Tốc độ vắt', value: '700 vòng/phút' },
            { label: 'Công nghệ', value: 'Digital Inverter' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Sắp xếp quần áo đều trong lồng giặt để máy cân bằng tốt. Lọc bẩn cần vệ sinh sau mỗi 3-5 lần giặt.',
        sku: 'SAMSUNG-WA95CG4545BDSV',
        price: 5790000,
        variant_name: 'Samsung WA95CG4545BDSV - 9.5kg cửa trên',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trên',
            'Khối Lượng Đồ Giặt': '9.5 kg',
            'Tốc Độ Vắt': '700 vòng/phút',
            'Thương Hiệu': 'Samsung',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 24,
    },
    {
        name: 'Máy giặt Samsung Inverter 10kg cửa trước WW10DG6U34LBSV',
        description: 'Máy giặt Samsung cửa trước 10kg, động cơ Inverter lặng yên bền bỉ, Ecobubble tạo bọt mịn giặt sạch ở nhiệt độ thấp, QuickDrive giặt nhanh hơn 50%, tự làm sạch lồng giặt.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'WW10DG6U34LBSV' },
            { label: 'Loại máy', value: 'Cửa trước' },
            { label: 'Khối lượng giặt', value: '10 kg' },
            { label: 'Tốc độ vắt', value: '1400 vòng/phút' },
            { label: 'Công nghệ', value: 'Digital Inverter + Ecobubble' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Vệ sinh lọc bơm xả (phía dưới cửa trước) định kỳ 1 tháng/lần. Dùng nước giặt lỏng chuyên dụng cho máy cửa trước.',
        sku: 'SAMSUNG-WW10DG6U34LBSV',
        price: 9090000,
        variant_name: 'Samsung WW10DG6U34LBSV - 10kg cửa trước',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trước',
            'Khối Lượng Đồ Giặt': '10 kg',
            'Tốc Độ Vắt': '1400 vòng/phút',
            'Thương Hiệu': 'Samsung',
            'Động cơ': 'Inverter',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 16,
    },
    {
        name: 'Máy giặt LG Inverter 11kg cửa trước FX1411N5W',
        description: 'Máy giặt LG cửa trước 11kg, động cơ AI Direct Drive bảo hành 20 năm, AI DD nhận biết vải và điều chỉnh chương trình giặt tối ưu, kết nối WiFi ThinQ điều khiển từ xa.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'FX1411N5W' },
            { label: 'Loại máy', value: 'Cửa trước' },
            { label: 'Khối lượng giặt', value: '11 kg' },
            { label: 'Tốc độ vắt', value: '1400 vòng/phút' },
            { label: 'Công nghệ', value: 'AI Direct Drive Inverter' },
            { label: 'Kết nối', value: 'WiFi ThinQ' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Việt Nam' },
        ],
        usage_guide: 'Tải ứng dụng LG ThinQ để theo dõi và điều khiển máy giặt từ xa. Chạy chế độ Tub Clean hàng tháng để vệ sinh lồng giặt.',
        sku: 'LG-FX1411N5W',
        price: 10990000,
        variant_name: 'LG FX1411N5W - 11kg cửa trước',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trước',
            'Khối Lượng Đồ Giặt': '11 kg',
            'Tốc Độ Vắt': '1400 vòng/phút',
            'Thương Hiệu': 'LG',
            'Động cơ': 'Inverter trực tiếp',
            'Sản xuất tại': 'Việt Nam'
        },
        stock: 14,
    },
    {
        name: 'Máy giặt Electrolux Inverter 10kg cửa trước EWF1024D3WC',
        description: 'Máy giặt Electrolux UltimateCare 300 cửa trước 10kg, motor Inverter tiết kiệm điện, vapoCare giặt hơi nước khử khuẩn 99.9%, SensorWash điều chỉnh thời gian giặt theo mức độ bẩn.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Electrolux' },
            { label: 'Model', value: 'EWF1024D3WC' },
            { label: 'Loại máy', value: 'Cửa trước' },
            { label: 'Khối lượng giặt', value: '10 kg' },
            { label: 'Tốc độ vắt', value: '1200 vòng/phút' },
            { label: 'Công nghệ', value: 'Inverter + vapoCare' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Dùng tính năng vapoCare để làm tươi quần áo không cần giặt. Vệ sinh bộ lọc xơ bông hàng tháng.',
        sku: 'ELECTROLUX-EWF1024D3WC',
        price: 9690000,
        variant_name: 'Electrolux EWF1024D3WC - 10kg cửa trước',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trước',
            'Khối Lượng Đồ Giặt': '10 kg',
            'Tốc Độ Vắt': '1200 vòng/phút',
            'Thương Hiệu': 'Electrolux',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 11,
    },
    {
        name: 'Máy giặt Panasonic Inverter 10.5kg cửa trên NA-FD105X3BV',
        description: 'Máy giặt Panasonic cửa trên 10.5kg, StainMaster+ xử lý vết bẩn cứng đầu, cánh khuấy COSMOS tăng hiệu quả giặt, Econavi điều chỉnh lượng nước theo tải giặt thực tế.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Panasonic' },
            { label: 'Model', value: 'NA-FD105X3BV' },
            { label: 'Loại máy', value: 'Cửa trên' },
            { label: 'Khối lượng giặt', value: '10.5 kg' },
            { label: 'Tốc độ vắt', value: '800 vòng/phút' },
            { label: 'Công nghệ', value: 'Inverter + Econavi' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Chọn chương trình StainMaster khi xử lý vết bẩn khó. Để nắp máy mở sau khi giặt để máy khô thoáng, tránh mốc.',
        sku: 'PANASONIC-NA-FD105X3BV',
        price: 9590000,
        variant_name: 'Panasonic NA-FD105X3BV - 10.5kg cửa trên',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trên',
            'Khối Lượng Đồ Giặt': '10.5 kg',
            'Tốc Độ Vắt': '800 vòng/phút',
            'Thương Hiệu': 'Panasonic',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 17,
    },
    {
        name: 'Máy giặt Toshiba Inverter 10kg cửa trước TW-T21BU110UWV(MG)',
        description: 'Máy giặt Toshiba cửa trước 10kg, động cơ Hybrid Inverter mạnh mẽ tiết kiệm điện, UltraFine Bubble tạo bong bóng nano giặt sạch sâu trong từng sợi vải, thiết kế màu xám hiện đại.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Toshiba' },
            { label: 'Model', value: 'TW-T21BU110UWV(MG)' },
            { label: 'Loại máy', value: 'Cửa trước' },
            { label: 'Khối lượng giặt', value: '10 kg' },
            { label: 'Tốc độ vắt', value: '1200 vòng/phút' },
            { label: 'Công nghệ', value: 'Hybrid Inverter + UltraFine Bubble' },
            { label: 'Màu sắc', value: 'Xám' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Dùng chế độ UltraFine Bubble để giặt quần áo trẻ em và đồ vải nhạy cảm. Bảo dưỡng lọc bơm xả hàng tháng.',
        sku: 'TOSHIBA-TW-T21BU110UWV-MG',
        price: 7590000,
        variant_name: 'Toshiba TW-T21BU110UWV(MG) - 10kg cửa trước',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trước',
            'Khối Lượng Đồ Giặt': '10 kg',
            'Tốc Độ Vắt': '1200 vòng/phút',
            'Thương Hiệu': 'Toshiba',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 19,
    },
    {
        name: 'Máy giặt Aqua Inverter 9.5kg cửa trước AQD-A952J BK',
        description: 'Máy giặt Aqua cửa trước 9.5kg, động cơ Direct Drive tiết kiệm điện, cửa kính cường lực chống trầy, Quick Wash giặt nhanh 15 phút, tự vệ sinh lồng giặt, thiết kế màu đen tinh tế.',
        category_id: 2,
        specifications: [
            { label: 'Thương hiệu', value: 'Aqua' },
            { label: 'Model', value: 'AQD-A952J BK' },
            { label: 'Loại máy', value: 'Cửa trước' },
            { label: 'Khối lượng giặt', value: '9.5 kg' },
            { label: 'Tốc độ vắt', value: '1200 vòng/phút' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Thêm nước giặt đúng ngăn chỉ định. Chạy chế độ tub clean hàng tháng để vệ sinh lồng giặt.',
        sku: 'AQUA-AQD-A952J-BK',
        price: 6590000,
        variant_name: 'Aqua AQD-A952J BK - 9.5kg cửa trước',
        variant_attributes: {
            'Loại Máy Giặt': 'Cửa trước',
            'Khối Lượng Đồ Giặt': '9.5 kg',
            'Tốc Độ Vắt': '1200 vòng/phút',
            'Thương Hiệu': 'Aqua',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 21,
    },

    // ===== MÁY SẤY (category_id = 3) =====
    {
        name: 'Máy sấy Casper 7.2kg thông hơi TD-72VWD',
        description: 'Máy sấy thông hơi Casper 7.2kg, thiết kế nhỏ gọn phù hợp gia đình nhỏ hoặc căn hộ, nhiều chương trình sấy tự động theo loại vải, thời gian sấy nhanh 60-90 phút, giá thành hợp lý.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Casper' },
            { label: 'Model', value: 'TD-72VWD' },
            { label: 'Loại máy sấy', value: 'Thông hơi' },
            { label: 'Khối lượng sấy', value: '7.2 kg' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Trung Quốc' },
        ],
        usage_guide: 'Cần lắp ống thoát hơi ra ngoài. Không sấy quá đầy lồng (tối đa 70% dung tích). Vệ sinh lọc xơ sau mỗi lần sấy.',
        sku: 'CASPER-TD-72VWD',
        price: 4990000,
        variant_name: 'Casper TD-72VWD - 7.2kg thông hơi',
        variant_attributes: {
            'Loại Máy Sấy': 'Thông hơi',
            'Khối Lượng Sấy': '7.2 kg',
            'Thương Hiệu': 'Casper',
            'Sản xuất tại': 'Trung Quốc'
        },
        stock: 30,
    },
    {
        name: 'Máy sấy Aqua 7kg thông hơi AQH-V700FW',
        description: 'Máy sấy thông hơi Aqua 7kg cửa trước, cảm biến độ ẩm tự động ngắt khi quần áo đã khô, bộ lọc xơ vải dễ vệ sinh, nhiều chương trình sấy thông minh theo loại vải bảo vệ quần áo.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Aqua' },
            { label: 'Model', value: 'AQH-V700FW' },
            { label: 'Loại máy sấy', value: 'Thông hơi' },
            { label: 'Khối lượng sấy', value: '7 kg' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Lắp ống thoát hơi ra cửa sổ hoặc ra ngoài trời. Không sấy đồ len hoặc tơ lụa. Lọc xơ vải vệ sinh sau mỗi lần sấy.',
        sku: 'AQUA-AQH-V700FW',
        price: 6090000,
        variant_name: 'Aqua AQH-V700FW - 7kg thông hơi',
        variant_attributes: {
            'Loại Máy Sấy': 'Thông hơi',
            'Khối Lượng Sấy': '7 kg',
            'Thương Hiệu': 'Aqua',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 20,
    },
    {
        name: 'Máy sấy Electrolux 9kg thông hơi EDV904H3WC',
        description: 'Máy sấy thông hơi Electrolux UltimateCare 300 9kg, cảm biến nhiệt độ và độ ẩm tự động điều chỉnh bảo vệ vải tối đa, chương trình đặc biệt cho đồ len, đồ trẻ em và quần áo thể thao.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Electrolux' },
            { label: 'Model', value: 'EDV904H3WC' },
            { label: 'Loại máy sấy', value: 'Thông hơi' },
            { label: 'Khối lượng sấy', value: '9 kg' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Cần lắp ống dẫn khí 4 inch ra ngoài. Lọc xơ phải vệ sinh sau mỗi chu kỳ sấy để đảm bảo hiệu quả sấy tốt nhất.',
        sku: 'ELECTROLUX-EDV904H3WC',
        price: 10690000,
        variant_name: 'Electrolux EDV904H3WC - 9kg thông hơi',
        variant_attributes: {
            'Loại Máy Sấy': 'Thông hơi',
            'Khối Lượng Sấy': '9 kg',
            'Thương Hiệu': 'Electrolux',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 13,
    },
    {
        name: 'Máy sấy Toshiba 8kg bơm nhiệt TD-T21B90HWV(MG)',
        description: 'Máy sấy bơm nhiệt Toshiba 8kg, tiết kiệm điện hơn 50% so với máy sấy thông hơi, không cần ống thoát hơi, sấy ở nhiệt độ thấp bảo vệ vải tốt hơn, hơi nước ngưng tụ xả qua ống hoặc thu vào thùng chứa.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Toshiba' },
            { label: 'Model', value: 'TD-T21B90HWV(MG)' },
            { label: 'Loại máy sấy', value: 'Bơm nhiệt' },
            { label: 'Khối lượng sấy', value: '8 kg' },
            { label: 'Màu sắc', value: 'Xám' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Có thể đặt trong phòng kín không cần ống thoát hơi. Thùng chứa nước ngưng tụ cần làm trống định kỳ hoặc kết nối ống thoát nước.',
        sku: 'TOSHIBA-TD-T21B90HWV-MG',
        price: 12890000,
        variant_name: 'Toshiba TD-T21B90HWV(MG) - 8kg bơm nhiệt',
        variant_attributes: {
            'Loại Máy Sấy': 'Bơm nhiệt',
            'Khối Lượng Sấy': '8 kg',
            'Thương Hiệu': 'Toshiba',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 9,
    },
    {
        name: 'Máy sấy Samsung 9kg bơm nhiệt DV90CGC2A0ABSV',
        description: 'Máy sấy bơm nhiệt Samsung 9kg, OptimalDry cảm biến độ ẩm 3 điểm cho kết quả sấy hoàn hảo, Air Wash làm sạch quần áo bằng không khí nóng mà không cần nước, kết nối SmartThings.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'DV90CGC2A0ABSV' },
            { label: 'Loại máy sấy', value: 'Bơm nhiệt' },
            { label: 'Khối lượng sấy', value: '9 kg' },
            { label: 'Màu sắc', value: 'Đen' },
            { label: 'Kết nối', value: 'SmartThings' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Kết nối ứng dụng SmartThings để theo dõi và nhận thông báo từ xa. Vệ sinh lọc xơ sau mỗi lần sấy.',
        sku: 'SAMSUNG-DV90CGC2A0ABSV',
        price: 14990000,
        variant_name: 'Samsung DV90CGC2A0ABSV - 9kg bơm nhiệt',
        variant_attributes: {
            'Loại Máy Sấy': 'Bơm nhiệt',
            'Khối Lượng Sấy': '9 kg',
            'Thương Hiệu': 'Samsung',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 10,
    },
    {
        name: 'Máy sấy LG 10.5kg bơm nhiệt DVHP50W',
        description: 'Máy sấy bơm nhiệt LG 10.5kg màu trắng, động cơ Inverter Direct Drive siêu tiết kiệm điện, AI Sensor nhận diện loại vải và điều chỉnh nhiệt độ tối ưu, kết nối WiFi ThinQ điều khiển từ xa.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'DVHP50W' },
            { label: 'Loại máy sấy', value: 'Bơm nhiệt' },
            { label: 'Khối lượng sấy', value: '10.5 kg' },
            { label: 'Kết nối', value: 'WiFi ThinQ' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Hàn Quốc' },
        ],
        usage_guide: 'Tải ứng dụng LG ThinQ để điều khiển từ xa và nhận thông báo khi sấy xong. Bảo hành motor 10 năm.',
        sku: 'LG-DVHP50W',
        price: 16990000,
        variant_name: 'LG DVHP50W - 10.5kg bơm nhiệt',
        variant_attributes: {
            'Loại Máy Sấy': 'Bơm nhiệt',
            'Khối Lượng Sấy': '10.5 kg',
            'Thương Hiệu': 'LG',
            'Sản xuất tại': 'Hàn Quốc'
        },
        stock: 7,
    },
    {
        name: 'Máy sấy Electrolux 8kg bơm nhiệt EDH803J5WC',
        description: 'Máy sấy bơm nhiệt Electrolux UltimateCare 800 8kg, SensiCare đo lường độ ẩm liên tục bảo vệ quần áo, hiệu suất năng lượng A+, chương trình Men\'s Shirt ủi thẳng quần áo khi sấy.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'Electrolux' },
            { label: 'Model', value: 'EDH803J5WC' },
            { label: 'Loại máy sấy', value: 'Bơm nhiệt' },
            { label: 'Khối lượng sấy', value: '8 kg' },
            { label: 'Hiệu suất điện', value: 'A+' },
            { label: 'Màu sắc', value: 'Trắng' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Làm trống thùng chứa nước ngưng tụ sau mỗi 1-2 chu kỳ sấy. Vệ sinh lọc xơ sau mỗi chu kỳ.',
        sku: 'ELECTROLUX-EDH803J5WC',
        price: 17390000,
        variant_name: 'Electrolux EDH803J5WC - 8kg bơm nhiệt',
        variant_attributes: {
            'Loại Máy Sấy': 'Bơm nhiệt',
            'Khối Lượng Sấy': '8 kg',
            'Thương Hiệu': 'Electrolux',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 6,
    },
    {
        name: 'Máy sấy LG 10.5kg bơm nhiệt DVHP50M',
        description: 'Máy sấy bơm nhiệt LG 10.5kg màu xám sang trọng, motor Inverter Direct Drive bảo hành 10 năm, Sensor Dry thông minh tự động dừng khi đồ đã khô, lồng sấy thép không gỉ chống mốc.',
        category_id: 3,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'DVHP50M' },
            { label: 'Loại máy sấy', value: 'Bơm nhiệt' },
            { label: 'Khối lượng sấy', value: '10.5 kg' },
            { label: 'Kết nối', value: 'WiFi ThinQ' },
            { label: 'Màu sắc', value: 'Xám' },
            { label: 'Xuất xứ', value: 'Hàn Quốc' },
        ],
        usage_guide: 'Lồng sấy không gỉ sét, tự làm sạch. Kết nối ThinQ để được tư vấn bảo dưỡng định kỳ từ LG.',
        sku: 'LG-DVHP50M',
        price: 18490000,
        variant_name: 'LG DVHP50M - 10.5kg bơm nhiệt',
        variant_attributes: {
            'Loại Máy Sấy': 'Bơm nhiệt',
            'Khối Lượng Sấy': '10.5 kg',
            'Thương Hiệu': 'LG',
            'Sản xuất tại': 'Hàn Quốc'
        },
        stock: 5,
    },

    // ===== MÁY LẠNH (category_id = 4) =====
    {
        name: 'Máy lạnh Casper Inverter 1HP GC-09IB36',
        description: 'Máy lạnh Casper 1 chiều 1HP Inverter, làm lạnh nhanh phù hợp phòng ngủ 10-15m², lọc không khí 4 lớp bao gồm lọc bụi, lọc carbon, lọc enzyme và lọc vitamin C, chế độ ngủ đêm thông minh.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Casper' },
            { label: 'Model', value: 'GC-09IB36' },
            { label: 'Công suất', value: '1 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Diện tích phù hợp', value: '10-15 m²' },
            { label: 'Xuất xứ', value: 'Trung Quốc' },
        ],
        usage_guide: 'Đặt nhiệt độ 26-28°C để tiết kiệm điện. Vệ sinh lọc bụi mỗi 2 tuần. Bảo dưỡng máy lạnh 6 tháng/lần.',
        sku: 'CASPER-GC-09IB36',
        price: 5990000,
        variant_name: 'Casper GC-09IB36 - 1HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Casper',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Trung Quốc'
        },
        stock: 35,
    },
    {
        name: 'Máy lạnh Funiki Inverter 1HP HIC09TMU.ST3',
        description: 'Máy lạnh Funiki 1 chiều 1HP Inverter, thương hiệu nội địa Việt Nam với mạng lưới bảo hành rộng khắp, lọc nano bạc kháng khuẩn khử mùi, làm lạnh nhanh mạnh tiết kiệm điện.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Funiki' },
            { label: 'Model', value: 'HIC09TMU.ST3' },
            { label: 'Công suất', value: '1 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Diện tích phù hợp', value: '10-15 m²' },
            { label: 'Xuất xứ', value: 'Việt Nam' },
        ],
        usage_guide: 'Thương hiệu Việt Nam với hơn 200 trung tâm bảo hành toàn quốc. Bảo dưỡng định kỳ 6 tháng/lần tại trung tâm Funiki.',
        sku: 'FUNIKI-HIC09TMU-ST3',
        price: 5890000,
        variant_name: 'Funiki HIC09TMU.ST3 - 1HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Funiki',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Việt Nam'
        },
        stock: 40,
    },
    {
        name: 'Máy lạnh Samsung Inverter 1HP AR40H09D0ATNSV',
        description: 'Máy lạnh Samsung Digital Inverter 1HP, DuraFin kháng ăn mòn bền lâu cho dàn nóng, làm mát cực nhanh trong 5 phút, lọc bụi mịn PM1.0, tự làm sạch dàn lạnh sau 30 phút hoạt động.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Samsung' },
            { label: 'Model', value: 'AR40H09D0ATNSV' },
            { label: 'Công suất', value: '1 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Digital Inverter' },
            { label: 'Diện tích phù hợp', value: '10-15 m²' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Sử dụng chế độ Auto-Cleaning sau mỗi 1-2 tuần. Không để đồ vật chắn trước dàn lạnh trong nhà để đảm bảo lưu thông khí.',
        sku: 'SAMSUNG-AR40H09D0ATNSV',
        price: 6690000,
        variant_name: 'Samsung AR40H09D0ATNSV - 1HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Samsung',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 28,
    },
    {
        name: 'Máy lạnh Casper Inverter 1.5HP GC-12IB36',
        description: 'Máy lạnh Casper 1 chiều 1.5HP Inverter, tiết kiệm điện đến 60% so với máy thường, làm lạnh nhanh phòng 15-20m², màng lọc Vitamin C chăm sóc da, tự sấy khô ngăn ẩm mốc sau tắt máy.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Casper' },
            { label: 'Model', value: 'GC-12IB36' },
            { label: 'Công suất', value: '1.5 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter' },
            { label: 'Diện tích phù hợp', value: '15-20 m²' },
            { label: 'Xuất xứ', value: 'Trung Quốc' },
        ],
        usage_guide: 'Phù hợp phòng ngủ 15-20m². Vệ sinh lọc bụi 2 tuần/lần. Bảo dưỡng gas lạnh và vệ sinh dàn hàng năm.',
        sku: 'CASPER-GC-12IB36',
        price: 6490000,
        variant_name: 'Casper GC-12IB36 - 1.5HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1.5 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Casper',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Trung Quốc'
        },
        stock: 32,
    },
    {
        name: 'Máy lạnh Daikin Inverter 1HP ATKB25YVMV',
        description: 'Máy lạnh Daikin 1 chiều 1HP Inverter cao cấp, cánh gió 3D làm mát đồng đều, Streamer kháng virus và vi khuẩn hiệu quả, tự làm sạch dàn lạnh sau mỗi 30 phút hoạt động, tiết kiệm điện xuất sắc.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Daikin' },
            { label: 'Model', value: 'ATKB25YVMV' },
            { label: 'Công suất', value: '1 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter + Streamer' },
            { label: 'Diện tích phù hợp', value: '10-15 m²' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Kích hoạt chế độ Streamer khi có người bệnh trong nhà để tiêu diệt vi khuẩn. Bảo dưỡng định kỳ tại trung tâm Daikin.',
        sku: 'DAIKIN-ATKB25YVMV',
        price: 10790000,
        variant_name: 'Daikin ATKB25YVMV - 1HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Daikin',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 22,
    },
    {
        name: 'Máy lạnh LG DUAL Inverter 1.5HP V13WIN1',
        description: 'Máy lạnh LG DUAL Inverter Compressor 1.5HP, 2 piston nén khí tiết kiệm điện hơn 70%, làm lạnh nhanh chỉ 4 phút, lọc bụi mịn PM1.0, kết nối WiFi ThinQ điều khiển từ điện thoại.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'LG' },
            { label: 'Model', value: 'V13WIN1' },
            { label: 'Công suất', value: '1.5 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'DUAL Inverter' },
            { label: 'Kết nối', value: 'WiFi ThinQ' },
            { label: 'Diện tích phù hợp', value: '15-20 m²' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Dùng ứng dụng LG ThinQ để lên lịch bật/tắt và tiết kiệm điện. Để nhiệt độ 26°C là tối ưu nhất.',
        sku: 'LG-V13WIN1',
        price: 11690000,
        variant_name: 'LG V13WIN1 - 1.5HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1.5 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'LG',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 18,
    },
    {
        name: 'Máy lạnh Toshiba Inverter 1.5HP RAS-H13Z2KCVG-V',
        description: 'Máy lạnh Toshiba Haori Premium 1.5HP, thiết kế Nhật Bản tinh tế, lọc enzyme phân giải vi khuẩn và allergen, Plasma Ion khử khuẩn không khí liên tục, chế độ làm lạnh Super Powerful cực nhanh.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Toshiba' },
            { label: 'Model', value: 'RAS-H13Z2KCVG-V' },
            { label: 'Công suất', value: '1.5 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter + Plasma Ion' },
            { label: 'Diện tích phù hợp', value: '15-20 m²' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Kích hoạt chế độ Plasma Ion để làm sạch không khí liên tục. Bộ lọc enzyme cần vệ sinh 3 tháng/lần.',
        sku: 'TOSHIBA-RAS-H13Z2KCVG-V',
        price: 11790000,
        variant_name: 'Toshiba RAS-H13Z2KCVG-V - 1.5HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1.5 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Toshiba',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 15,
    },
    {
        name: 'Máy lạnh Panasonic Inverter 1HP CU/CS-PU9AKH-8',
        description: 'Máy lạnh Panasonic 1 chiều 1HP, nanoe-X thế hệ mới tạo OH radical khử khuẩn và mùi hôi hiệu quả, cảm biến Econavi + Inverter thích ứng nhiệt độ phòng và hoạt động của người dùng.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Panasonic' },
            { label: 'Model', value: 'CU/CS-PU9AKH-8' },
            { label: 'Công suất', value: '1 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter + nanoe-X + Econavi' },
            { label: 'Diện tích phù hợp', value: '10-15 m²' },
            { label: 'Xuất xứ', value: 'Malaysia' },
        ],
        usage_guide: 'Bật chế độ nanoe-X khi muốn lọc sạch không khí. Chế độ Econavi tự điều chỉnh theo số người trong phòng.',
        sku: 'PANASONIC-CU-CS-PU9AKH-8',
        price: 11990000,
        variant_name: 'Panasonic CU/CS-PU9AKH-8 - 1HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Panasonic',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Malaysia'
        },
        stock: 20,
    },
    {
        name: 'Máy lạnh Daikin Inverter 1.5HP ATKB35YVMV',
        description: 'Máy lạnh Daikin 1 chiều 1.5HP, thiết kế mỏng nhẹ treo tường sang trọng, 3D Airflow cánh gió đa chiều làm mát đồng đều toàn phòng, Streamer kháng virus và làm sạch không khí hiệu quả.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Daikin' },
            { label: 'Model', value: 'ATKB35YVMV' },
            { label: 'Công suất', value: '1.5 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter + Streamer + 3D Airflow' },
            { label: 'Diện tích phù hợp', value: '15-20 m²' },
            { label: 'Xuất xứ', value: 'Thái Lan' },
        ],
        usage_guide: 'Chế độ Powerful làm lạnh nhanh tối đa trong 20 phút đầu, sau đó trở về chế độ thường tiết kiệm điện hơn.',
        sku: 'DAIKIN-ATKB35YVMV',
        price: 13590000,
        variant_name: 'Daikin ATKB35YVMV - 1.5HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1.5 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Daikin',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Thái Lan'
        },
        stock: 16,
    },
    {
        name: 'Máy lạnh Panasonic Inverter 1.5HP CU/CS-PU12AKH-8',
        description: 'Máy lạnh Panasonic 1 chiều 1.5HP, cảm biến Econavi theo dõi hoạt động và ánh sáng phòng để điều chỉnh công suất tối ưu, nanoe-X tiêu diệt virus và vi khuẩn đến 99.99%.',
        category_id: 4,
        specifications: [
            { label: 'Thương hiệu', value: 'Panasonic' },
            { label: 'Model', value: 'CU/CS-PU12AKH-8' },
            { label: 'Công suất', value: '1.5 HP' },
            { label: 'Loại', value: '1 chiều' },
            { label: 'Công nghệ', value: 'Inverter + nanoe-X + Econavi' },
            { label: 'Diện tích phù hợp', value: '15-20 m²' },
            { label: 'Xuất xứ', value: 'Malaysia' },
        ],
        usage_guide: 'Phù hợp phòng 15-20m². Bảo hành máy nén 5 năm, linh kiện 3 năm theo chính sách Panasonic Việt Nam.',
        sku: 'PANASONIC-CU-CS-PU12AKH-8',
        price: 14890000,
        variant_name: 'Panasonic CU/CS-PU12AKH-8 - 1.5HP',
        variant_attributes: {
            'Kiểu dáng': 'Treo tường',
            'Công Suất Làm Lạnh (HP)': '1.5 HP',
            'Công Nghệ Inverter': 'Có',
            'Thương Hiệu': 'Panasonic',
            'Loại máy': '1 chiều',
            'Sản xuất tại': 'Malaysia'
        },
        stock: 14,
    },
];

// ============================================================
// SEED FUNCTION
// ============================================================
const seedProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Check if products already exist for these categories
        const [existingRows] = await sequelize.query(
            'SELECT COUNT(*) as count FROM products WHERE category_id IN (1, 2, 3, 4)'
        );
        const existingCount = existingRows[0].count;

        if (existingCount > 0) {
            console.log(`⚠ Found ${existingCount} existing products for categories 1-4.`);
            console.log('  To re-seed, delete existing products first or pass --force flag.');
            if (!process.argv.includes('--force')) {
                process.exit(0);
            }
            console.log('  --force detected: continuing with seed...');
        }

        const t = await sequelize.transaction();

        try {
            let insertedCount = 0;

            for (const product of productsData) {
                // Check for duplicate SKU
                const [existing] = await sequelize.query(
                    'SELECT id FROM product_variants WHERE sku = ?',
                    { replacements: [product.sku], transaction: t }
                );

                if (existing.length > 0) {
                    console.log(`  → Skipping duplicate SKU: ${product.sku}`);
                    continue;
                }

                // Insert product
                const [productResult] = await sequelize.query(
                    `INSERT INTO products (name, description, category_id, specifications, usage_guide, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                    {
                        replacements: [
                            product.name,
                            product.description,
                            product.category_id,
                            JSON.stringify(product.specifications),
                            product.usage_guide,
                        ],
                        transaction: t,
                        type: Sequelize.QueryTypes.INSERT,
                    }
                );

                const productId = productResult;
                const costPrice = Math.round(product.price * 0.75);

                // Insert product variant
                await sequelize.query(
                    `INSERT INTO product_variants (product_id, sku, name, attributes, price, cost_price, stock_quantity, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
                    {
                        replacements: [
                            productId,
                            product.sku,
                            product.variant_name,
                            JSON.stringify(product.variant_attributes),
                            product.price,
                            costPrice,
                            product.stock,
                        ],
                        transaction: t,
                        type: Sequelize.QueryTypes.INSERT,
                    }
                );

                console.log(`  ✓ [cat=${product.category_id}] ${product.name}`);
                insertedCount++;
            }

            await t.commit();
            console.log(`\n✅ Seed completed: ${insertedCount} products inserted`);
            process.exit(0);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('\n✗ Seed failed:', error.message);
        process.exit(1);
    }
};

seedProducts();
