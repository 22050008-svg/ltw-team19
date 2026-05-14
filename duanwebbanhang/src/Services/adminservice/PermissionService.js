import api from '../../api/axiosConfig';

/**
 * Lấy danh sách tất cả các quyền (permissions) có trong hệ thống.
 * Hàm này thường được gọi trong modal quản lý vai trò (RoleModal) để hiển thị
 * danh sách các quyền mà admin có thể gán cho một vai trò.
 * @returns {Promise} - Một promise trả về response của Axios. 
 * `response.data` sẽ là một mảng các đối tượng permission.
 * Ví dụ: [{ id: 1, name: 'view_users', description: '...', group: '...' }, ...]
 */
const getPermissions = () => {
  return api.get('/admin/permissions');
};

// Gom các hàm vào một object để export
const permissionService = {
  getPermissions,
};

export default permissionService;