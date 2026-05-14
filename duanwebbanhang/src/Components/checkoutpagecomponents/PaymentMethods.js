import React from 'react';
import { Radio, Card, Space } from 'antd';
import { CreditCardOutlined, MoneyCollectOutlined, QrcodeOutlined } from '@ant-design/icons';

const PaymentMethods = ({ onChange, value }) => {
  return (
    <Card title="Phương thức thanh toán">
      <Radio.Group onChange={(e) => onChange(e.target.value)} value={value}>
        <Space direction="vertical" className="w-full">
          <Radio value="COD" className="border p-3 rounded-md w-full">
            <MoneyCollectOutlined /> Thanh toán khi nhận hàng (COD)
          </Radio>
<<<<<<< HEAD
          <Radio value="sepay" className="border p-3 rounded-md w-full">
            <QrcodeOutlined /> Thanh toán bằng mã QR (Chuyển khoản ngân hàng)
=======
          <Radio value="sebay" className="border p-3 rounded-md w-full">
            <QrcodeOutlined /> Thanh toán chuyển khoản (QR Code)
>>>>>>> ac6dd00b72c6ee8bba8c78758ebd7d466978cee9
          </Radio>
          {/* Thêm các phương thức khác ở đây nếu cần */}
        </Space>
      </Radio.Group>
    </Card>
  );
};

export default PaymentMethods;