import React, { useState } from 'react';
import { InputNumber, Button, Space } from 'antd';

const PriceFilter = ({ onPriceChange }) => {
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [errors, setErrors] = useState('');

  const handleApply = () => {
    // Validate: min không được lớn hơn max
    if (minPrice && maxPrice && minPrice > maxPrice) {
      setErrors('Giá min không thể lớn hơn giá max');
      return;
    }
    setErrors('');
    onPriceChange(minPrice, maxPrice);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <InputNumber
        min={0}
        value={minPrice}
        onChange={setMinPrice}
        placeholder="Từ"
        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value.replace(/,/g, '')}
        style={{ flex: 1, minWidth: '60px' }}
        size="middle"
      />
      <InputNumber
        min={0}
        value={maxPrice}
        onChange={setMaxPrice}
        placeholder="Đến"
        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value.replace(/,/g, '')}
        style={{ flex: 1, minWidth: '60px' }}
        size="middle"
      />
      <Button type="primary" onClick={handleApply} size="middle">
        Lọc
      </Button>
      {errors && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', width: '100%' }}>
          {errors}
        </div>
      )}
    </Space.Compact>
  );
};

export default PriceFilter;