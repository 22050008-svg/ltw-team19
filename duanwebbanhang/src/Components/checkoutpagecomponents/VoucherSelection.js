import React from 'react';
import { Select, Typography, Divider } from 'antd';

const { Option } = Select;
const { Title } = Typography;

const VoucherSelection = ({ vouchers = [], onSelectVoucher, selectedVoucher, subTotal }) => {

  const handleSelectChange = (voucherCode) => {
    if (!voucherCode) {
      onSelectVoucher(null);
      return;
    }
    const voucher = vouchers.find(v => v.code === voucherCode);
    onSelectVoucher(voucher);
  };

  const isVoucherApplicable = (voucher) => {
    return !voucher.minPurchase || subTotal >= voucher.minPurchase;
  };

  return (
    <div className="mb-4">
      <Title level={5}>Mã giảm giá</Title>
      <Select
        showSearch
        allowClear
        placeholder="Chọn hoặc nhập mã giảm giá"
        style={{ width: '100%' }}
        onChange={handleSelectChange}
        value={selectedVoucher?.code}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {Array.isArray(vouchers) && vouchers.map(voucher => (
          <Option key={voucher.id} value={voucher.code} disabled={!isVoucherApplicable(voucher)}>
            {voucher.code} - {voucher.description}
          </Option>
        ))}
      </Select>
      <Divider />
    </div>
  );
};

export default VoucherSelection;