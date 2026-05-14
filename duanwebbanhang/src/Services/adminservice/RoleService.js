import api from '../../api/axiosConfig';

// --- Role Management ---

/** Lấy danh sách vai trò (kèm theo quyền hạn) */
const getRoles = () => {
  return api.get('/admin/roles');
};

/** Tạo vai trò mới */
const createRole = (roleData) => {
  return api.post('/admin/roles', roleData);
};

/** Cập nhật vai trò */
const updateRole = (id, roleData) => {
  return api.put(`/admin/roles/${id}`, roleData);
};

/** xóa vai trò */
const deleteRole = (id, roleData) => {
  return api.delete(`/admin/roles/${id}`, roleData);
};

// --- Permission Management ---

/** Lấy tất cả các quyền hạn có trong hệ thống */
const getPermissions = () => {
  return api.get('/admin/permissions');
};


const roleService = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
};

export default roleService;
