import api from '../../api/axiosConfig'; // Sử dụng chung instance axios đã được cấu hình

/**
 * Lấy danh sách tất cả các voucher.
 * Endpoint: GET /api/v1/admin/vouchers
 */
const getVouchers = () => {
  // Token xác thực (quyền admin) sẽ được axios interceptor tự động đính kèm
  return api.get('/admin/vouchers');
};

/**
 * Tạo một voucher mới.
 * Endpoint: POST /api/v1/admin/vouchers
 * @param {object} voucherData - Dữ liệu của voucher mới.
 * Ví dụ: { code, discountType, discountValue, expiryDate, usageLimit, minPurchase }
 */
const createVoucher = (voucherData) => {
  return api.post('/admin/vouchers', voucherData);
};

/**
 * Lấy thông tin chi tiết một voucher cụ thể.
 * (Hàm này hữu ích khi bạn cần load dữ liệu cho form chỉnh sửa)
 * Endpoint: GET /api/v1/admin/vouchers/:id
 * @param {string|number} id - ID của voucher.
 */
const getVoucherById = (id) => {
    return api.get(`/admin/vouchers/${id}`);
};

/**
 * Cập nhật thông tin một voucher đã có.
 * Endpoint: PUT /api/v1/admin/vouchers/:id
 * @param {string|number} id - ID của voucher cần cập nhật.
 * @param {object} updatedData - Dữ liệu cần cập nhật.
 */
const updateVoucher = (id, updatedData) => {
  return api.put(`/admin/vouchers/${id}`, updatedData);
};

/**
 * Xóa một voucher.
 * Endpoint: DELETE /api/v1/admin/vouchers/:id
 * @param {string|number} id - ID của voucher cần xóa.
 */
const deleteVoucher = (id) => {
  return api.delete(`/admin/vouchers/${id}`);
};

/**
 * Tính toán số tiền được giảm và tổng tiền cuối cùng dựa trên voucher.
 * Đây là một hàm helper phía client, không gọi API.
 * @param {number} subTotal - Tổng tiền tạm tính của giỏ hàng.
 * @param {object} voucher - Đối tượng voucher được chọn.
 * @returns {{finalTotal: number, discountAmount: number}}
 */
const calculateDiscount = (subTotal, voucher) => {
    if (!voucher || subTotal < (voucher.minPurchase || 0)) {
        return { finalTotal: subTotal, discountAmount: 0 };
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
        discountAmount = subTotal * (voucher.discountValue / 100);
    } else { // fixed_amount
        discountAmount = voucher.discountValue;
    }

    // Đảm bảo số tiền giảm không vượt quá tổng tiền
    discountAmount = Math.min(discountAmount, subTotal);

    const finalTotal = Math.max(0, subTotal - discountAmount);

    return { finalTotal, discountAmount };
};

const voucherService = {
  getVouchers,
  createVoucher,
  getVoucherById, // Thêm hàm này để tiện cho việc edit
  updateVoucher,
  deleteVoucher,
  calculateDiscount, // Thêm hàm tính toán vào service
};

export default voucherService;