import React from 'react';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined, YoutubeOutlined } from '@ant-design/icons';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="mx-2 mt-2 justify-items center">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về Mèo Vàng</h3>
            <p className="text-gray-400">
              Mèo Vàng là cửa hàng cung cấp các sản phẩm chất lượng cao, đa dạng về mẫu mã và giá cả hợp lý.
            </p>
          </div>

          {/* Warranty Policy */}
          <div>
            <h3 className="text-lg font-bold mb-4">Chính sách bảo hành</h3>
            <ul className="space- text-gray-400 text-sm">
              <li><span className="font-semibold text-gray-200">Điều kiện:</span> Còn hạn, tem, nguyên trạng, lỗi do nhà sản xuất.</li>
              <li><span className="font-semibold text-gray-200">Từ chối:</span> Hết hạn, hư hỏng do người dùng, mất tem, sửa chữa bên ngoài.</li>
              <li><span className="font-semibold text-gray-200">Lưu ý:</span> Dữ liệu không được bảo hành. Chúng tôi là trung gian bảo hành theo chính sách của hãng.</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
              <li>Email: support@meovang.com</li>
              <li>Điện thoại: (012) 345-6789</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
            <div className="justify-center flex space-x-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-500"><FacebookOutlined /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-pink-500"><InstagramOutlined /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400"><TwitterOutlined /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-600"><YoutubeOutlined /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mèo Vàng. Đã đăng ký Bản quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;