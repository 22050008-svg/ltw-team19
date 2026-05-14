export const mockAllPermissions = [
  // --- Nhóm Quản lý Người dùng ---
  { id: 1, name: 'view_users', description: 'Xem danh sách người dùng & nhân viên', group: 'Quản lý Người dùng' },
  { id: 2, name: 'create_user', description: 'Tạo tài khoản người dùng & nhân viên', group: 'Quản lý Người dùng' },
  { id: 3, name: 'update_user', description: 'Cập nhật thông tin & vai trò người dùng', group: 'Quản lý Người dùng' },
  { id: 4, name: 'deactivate_user', description: 'Kích hoạt/Vô hiệu hóa tài khoản', group: 'Quản lý Người dùng' },

  // --- Nhóm Quản lý Vai trò ---
  { id: 5, name: 'manage_roles', description: 'Xem, tạo, sửa, xóa vai trò & phân quyền', group: 'Quản lý Vai trò' },

  // --- Nhóm Quản lý Sản phẩm ---
  { id: 6, name: 'view_products_admin', description: 'Xem danh sách sản phẩm (Admin)', group: 'Quản lý Sản phẩm' },
  { id: 7, name: 'create_product', description: 'Tạo sản phẩm mới', group: 'Quản lý Sản phẩm' },
  { id: 8, name: 'update_product', description: 'Cập nhật thông tin sản phẩm', group: 'Quản lý Sản phẩm' },
  { id: 9, name: 'delete_product', description: 'Xóa sản phẩm', group: 'Quản lý Sản phẩm' },
  
  // --- Nhóm Quản lý Danh mục ---
  { id: 10, name: 'view_categories_admin', description: 'Xem danh sách danh mục (Admin)', group: 'Quản lý Danh mục' },
  { id: 11, name: 'create_category', description: 'Tạo danh mục mới', group: 'Quản lý Danh mục' },
  { id: 12, name: 'update_category', description: 'Cập nhật danh mục', group: 'Quản lý Danh mục' },
  { id: 13, name: 'delete_category', description: 'Xóa danh mục', group: 'Quản lý Danh mục' },

  // --- Nhóm Quản lý Kho ---
  { id: 14, name: 'view_inventory', description: 'Xem lịch sử & báo cáo tồn kho', group: 'Quản lý Kho' },
  { id: 15, name: 'manage_inventory', description: 'Thực hiện điều chỉnh kho', group: 'Quản lý Kho' },

  // --- Nhóm Quản lý Đơn hàng ---
  { id: 16, name: 'view_orders', description: 'Xem tất cả đơn hàng hệ thống', group: 'Quản lý Đơn hàng' },
  { id: 17, name: 'update_order_status', description: 'Cập nhật trạng thái đơn hàng', group: 'Quản lý Đơn hàng' },

  // --- Nhóm Quản lý Mã giảm giá ---
  { id: 18, name: 'view_vouchers', description: 'Xem danh sách mã giảm giá', group: 'Quản lý Mã giảm giá' },
  { id: 19, name: 'create_voucher', description: 'Tạo mã giảm giá mới', group: 'Quản lý Mã giảm giá' },
  { id: 20, name: 'update_voucher', description: 'Cập nhật mã giảm giá', group: 'Quản lý Mã giảm giá' },
  { id: 21, name: 'delete_voucher', description: 'Xóa mã giảm giá', group: 'Quản lý Mã giảm giá' },
  
  // --- Nhóm Quản lý Tài chính ---
  { id: 22, name: 'view_financial_report', description: 'Xem báo cáo tài chính, doanh thu', group: 'Quản lý Tài chính' },
  { id: 23, name: 'manage_finances', description: 'Tạo giao dịch tài chính thủ công', group: 'Quản lý Tài chính' }
];
// Tương ứng với API: GET /api/v1/admin/roles
export const mockRolesWithPermissions = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Toàn quyền quản trị hệ thống',
    // Gồm tất cả ID từ 1 đến 23
    permissionIds: Array.from({ length: 23 }, (_, i) => i + 1), 
  },
  {
    id: 2,
    name: 'Quản lý Sản phẩm',
    description: 'Chịu trách nhiệm về sản phẩm, danh mục và xem tồn kho',
    permissionIds: [6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  {
    id: 3,
    name: 'Quản lý Đơn hàng',
    description: 'Chịu trách nhiệm xử lý đơn hàng và các chương trình giảm giá',
    permissionIds: [1, 16, 17, 18, 19, 20, 21],
  },
  {
    id: 4,
    name: 'Quản lý Kho',
    description: 'Chịu trách nhiệm quản lý nhập, xuất, tồn kho',
    permissionIds: [6, 14, 15],
  },
  {
    id: 5,
    name: 'Kế toán',
    description: 'Chịu trách nhiệm quản lý tài chính và báo cáo',
    permissionIds: [16, 18, 22, 23],
  }
];
// Tương ứng với API: GET /api/v1/admin/users
export const mockUsers = [
  {
    id: 1,
    fullName: 'Hoàng An (Admin)',
    email: 'super.admin@shop.com',
    isActive: true,
    roles: [
      { id: 1, name: 'Super Admin' }
    ],
  },
  {
    id: 2,
    fullName: 'Trần Minh Tuấn',
    email: 'tuan.tran@shop.com',
    isActive: true,
    roles: [
      { id: 2, name: 'Quản lý Sản phẩm' }
    ],
  },
  {
    id: 3,
    fullName: 'Lê Thu Hà',
    email: 'ha.le@shop.com',
    isActive: true,
    roles: [
      { id: 3, name: 'Quản lý Đơn hàng' }
    ],
  },
  {
    id: 4,
    fullName: 'Phạm Văn Khoa',
    email: 'khoa.pham@shop.com',
    isActive: true,
    roles: [
        { id: 4, name: 'Quản lý Kho' }
    ],
  },
  {
    id: 5,
    fullName: 'Nguyễn Thị Mai',
    email: 'mai.nguyen@shop.com',
    isActive: true,
    roles: [
        { id: 5, name: 'Kế toán' }
    ],
  },
  {
    id: 6,
    fullName: 'Vũ Ngọc Bảo',
    email: 'bao.vu@shop.com',
    isActive: true,
    // Trường hợp nhân viên có nhiều vai trò
    roles: [
      { id: 2, name: 'Quản lý Sản phẩm' },
      { id: 4, name: 'Quản lý Kho' }
    ],
  },
  {
    id: 7,
    fullName: 'Đinh Công Lực (Cũ)',
    email: 'luc.dinh@shop.com',
    // Trường hợp nhân viên bị vô hiệu hóa
    isActive: false, 
    roles: [
        { id: 3, name: 'Quản lý Đơn hàng' }
    ],
  },
];
export const mockAllRoles = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Quản lý Sản phẩm' },
  { id: 3, name: 'Quản lý Đơn hàng' },
  { id: 4, name: 'Quản lý Kho' },
  { id: 5, name: 'Kế toán' },
];