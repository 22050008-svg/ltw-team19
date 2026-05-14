
// Dữ liệu này giả lập danh sách người dùng mà API /users sẽ trả về.
export const mockUserList = [
  {
    id: 1,
    fullName: 'Quản Trị Viên',
    email: 'admin@gmail.com',
    isActive: true,
    roles: [
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
    ],
  },
  {
    id: 2,
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    isActive: true,
    roles: [
      { id: 2, name: 'user' },
    ],
  },
  {
    id: 3,
    fullName: 'Trần Thị B',
    email: 'tranthib@email.com',
    isActive: false, // Người dùng này bị vô hiệu hóa
    roles: [
      { id: 2, name: 'user' },
    ],
  },
  {
    id: 4,
    fullName: 'Lê Văn C',
    email: 'levanc@email.com',
    isActive: true,
    roles: [
      { id: 2, name: 'user' },
    ],
  },
];

// Dữ liệu này giả lập đối tượng user mà API /me hoặc API /login trả về cho người dùng admin.
// Chúng ta sẽ dùng nó để giả lập trạng thái "đã đăng nhập" trong AuthContext.
export const mockAdminUser = {
  id: 1,
  fullName: 'Hoàng An (Admin)',
  email: 'super.admin@shop.com',
  isActive: true,
  roles: [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Quản lý Sản phẩm' }
    ],
};