import api from '../../api/axiosConfig';

/** Lấy danh sách sản phẩm cho admin */
const getAllProducts = (params = {}) => {
  return api.get('/admin/products', { params });
};

/** Tạo sản phẩm mới */
const createProduct = (productData) => {
  return api.post('/admin/products', productData);
};

/** Cập nhật sản phẩm */
const updateProduct = (id, productData) => {
  return api.put(`/admin/products/${id}`, productData);
};

/** Xóa sản phẩm */
const deleteProduct = (id) => {
  return api.delete(`/admin/products/${id}`);
};

/**
 * Cập nhật ảnh cho sản phẩm.
 * @param {string|number} id - ID của sản phẩm.
 * @param {string} dataUrl - Chuỗi base64 của file ảnh (dưới dạng data URL).
 */
const updateProductImage = (id, dataUrl) => {
  // If dataUrl is already FormData, use it directly
  if (dataUrl instanceof FormData) {
    return api.post(`/admin/products/${id}/image`, dataUrl);
  }

  const formData = new FormData();
  // Hàm tiện ích để chuyển đổi data URL (base64) thành Blob
  if (typeof dataUrl === "string" && dataUrl.startsWith("data:image")) {
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });
    formData.append("productImage", blob, "uploaded_image.png");
  }

  // ⚠️ QUAN TRỌNG: Không set Content-Type header!
  // Khi dùng FormData, Axios tự động set Content-Type với boundary
  // Nếu ta set 'multipart/form-data' mà không có boundary, multer sẽ không parse được
  return api.post(`/admin/products/${id}/image`, formData);
};

/**
 * Xóa ảnh sản phẩm.
 * @param {string|number} productId - ID của sản phẩm.
 * @param {string|number} imageId - ID của ProductImage cần xóa.
 */
const deleteProductImage = (productId, imageId) => {
  return api.delete(`/admin/products/${productId}/images/${imageId}`);
};

const productAdminService = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImage,
  deleteProductImage,
};

export default productAdminService;