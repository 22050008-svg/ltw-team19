import React, { useMemo } from 'react';
import { Card, Typography, Rate, Input, Button, List, Form, Avatar, Space } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductDescription = ({ product }) => {
  // Hàm để xử lý chuỗi HTML, thêm tiền tố vào đường dẫn ảnh
  const processedHtml = useMemo(() => {
    if (!product.htmlDescription) {
      return '';
    }
    const baseUrl = 'https://matilde-venomless-brittni.ngrok-free.dev';
    const parser = new DOMParser();
    const doc = parser.parseFromString(product.htmlDescription, 'text/html');

    // Tìm tất cả các thẻ <img>
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const currentSrc = img.getAttribute('src');
      // Kiểm tra nếu src là đường dẫn tương đối (không bắt đầu bằng http, https, hoặc //)
      if (currentSrc && !/^(https?:)?\/\//.test(currentSrc)) {
        // Đảm bảo có một dấu / duy nhất giữa baseUrl và đường dẫn ảnh
        const newSrc = currentSrc.startsWith('/') ? currentSrc : `/${currentSrc}`;
        img.src = `${baseUrl}${newSrc}`;
      }
    });
    return doc.body.innerHTML;
  }, [product.htmlDescription]);
  // Dữ liệu giả cho bình luận
  const comments = [
    { author: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1', content: <p>Sản phẩm rất tốt, đúng như mô tả. Sẽ ủng hộ shop lần sau!</p>, datetime: '2 ngày trước', rating: 5 },
    { author: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=2', content: <p>Giao hàng nhanh, đóng gói cẩn thận. Chất lượng sản phẩm tuyệt vời.</p>, datetime: '3 ngày trước', rating: 4 },
  ];

  return (
    <Card title={<Title level={3}>Mô Tả Chi Tiết & Đánh Giá Sản Phẩm</Title>} variant="borderless" className="mt-8 m-0">
      {/* Phần Mô Tả Chi Tiết */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />

    </Card>
  );
};

export default ProductDescription;