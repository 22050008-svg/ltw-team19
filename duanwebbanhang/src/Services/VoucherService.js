import api from '../api/axiosConfig';

/**
 * Lấy danh sách các voucher hợp lệ mà người dùng có thể sử dụng.
 * Endpoint: GET /api/v1/vouchers/available
 */
const getAvailableVouchers = () => {
  return api.get('/admin/vouchers/');
};

/**
 * Tính toán số tiền được giảm và tổng tiền cuối cùng.
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
  getAvailableVouchers,
  calculateDiscount,
};

export default voucherService;