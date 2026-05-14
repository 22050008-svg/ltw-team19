import api from '../api/axiosConfig'; // Sử dụng chung instance axios đã được cấu hình

// --- User Profile Functions ---

/**
 * Cập nhật thông tin cá nhân của người dùng đã đăng nhập (họ tên, SĐT).
 * Endpoint: PUT /api/v1/profile
 * @param {object} profileData - Dữ liệu cần cập nhật. Ví dụ: { fullName: '...', phone: '...' }
 */
const updateProfile = (profileData) => {
  return api.put('/profile', profileData);
};

/**
 * Cập nhật ảnh đại diện của người dùng đang đăng nhập.
 * Endpoint: PUT /api/v1/profile/avatar
 * @param {File} avatarFile - Đối tượng File ảnh người dùng đã chọn.
 */
const updateAvatar = (avatarFile) => {
  const formData = new FormData();
  // 'avatar' là key mà backend của bạn mong đợi để nhận file
  // Axios sẽ tự động xử lý file và đặt header 'Content-Type': 'multipart/form-data'
  formData.append('avatar', avatarFile);

  return api.put('/profile/avatar', formData, {
    // Thêm header một cách tường minh để đảm bảo tính nhất quán
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Thay đổi mật khẩu của người dùng đã đăng nhập.
 * Endpoint: PUT /api/v1/profile/password
 * @param {object} passwordData - Chứa mật khẩu cũ và mới. 
 * Ví dụ: { currentPassword: '...', newPassword: '...' }
 */
const changePassword = (passwordData) => {
  return api.put('/profile/password', passwordData);
};


// --- Address Management Functions ---

/**
 * Lấy danh sách tất cả địa chỉ của người dùng đã đăng nhập.
 * Endpoint: GET /api/v1/profile/addresses
 */
const getAddresses = () => {
  return api.get('/profile/addresses');
};

/**
 * Thêm một địa chỉ mới cho người dùng.
 * Endpoint: POST /api/v1/profile/addresses
 * @param {object} addressData - Dữ liệu của địa chỉ mới.
 * Ví dụ: { recipientName, phone, street, isDefault }
 */
const addAddress = (addressData) => {
  return api.post('/profile/addresses', addressData);
};

/**
 * Cập nhật thông tin một địa chỉ đã có.
 * Endpoint: PUT /api/v1/profile/addresses/:id
 * @param {string|number} id - ID của địa chỉ cần cập nhật.
 * @param {object} updatedData - Dữ liệu cần cập nhật.
 */
const updateAddress = (id, updatedData) => {
  return api.put(`/profile/addresses/${id}`, updatedData);
};

/**
 * Xóa một địa chỉ khỏi sổ địa chỉ của người dùng.
 * Endpoint: DELETE /api/v1/profile/addresses/:id
 * @param {string|number} id - ID của địa chỉ cần xóa.
 */
const deleteAddress = (id) => {
  return api.delete(`/profile/addresses/${id}`);
};


// --- Export Service Object ---

const profileService = {
  // Profile
  updateProfile,
  updateAvatar,
  changePassword,
  // Addresses
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};

export default profileService;