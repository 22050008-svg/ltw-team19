import { Carousel, Button, Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import PosterService from '../../Services/PosterService';
import { ArrowRightOutlined } from '@ant-design/icons';

// Backend URL từ axiosConfig
const BACKEND_URL = 'http://localhost:4321';

const HomeCarousel = () => {
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepagePosters();
  }, []);

  const fetchHomepagePosters = async () => {
    try {
      setLoading(true);
      const response = await PosterService.getHomepagePosters();
      
      // Extract poster array from nested response structure
      const dataWrapper = response.data?.data;
      if (dataWrapper && Array.isArray(dataWrapper.data)) {
        setPosters(dataWrapper.data);
      }
    } catch (error) {
      console.error('❌ Error fetching homepage posters:', error);
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  // ★ THÊM: Handle poster click - navigate to redirectUrl
  const handlePosterClick = (poster) => {
    if (poster.redirectUrl) {
      // Check if it's an external URL or internal route
      if (poster.redirectUrl.startsWith('http')) {
        window.open(poster.redirectUrl, '_blank');
      } else {
        navigate(poster.redirectUrl);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Spin size="large" />
      </div>
    );
  }

  // If posters exist, display them in a carousel
  if (posters.length > 0) {
    return (
      <Carousel autoplay autoplaySpeed={5000} effect="fade" style={{ overflow: 'hidden' }}>
        {posters.map((poster) => (
          <div 
            key={poster.id} 
            style={{ position: 'relative', cursor: poster.redirectUrl ? 'pointer' : 'default' }}
            onClick={() => handlePosterClick(poster)}
          >
            <img
              src={`${BACKEND_URL}${poster.imageUrl}`}
              alt={poster.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                backgroundColor: '#f5f5f5'
              }}
            />
            {/* Overlay gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
              }}
            />
          </div>
        ))}
      </Carousel>
    );
  }

  // Fallback: Show default carousel if no posters
  return (
    <div>
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          backgroundImage: `url('https://www.homepaylater.vn/static/9190ec774f25b5a79e6c1be363c5f876/c579c/gia_tu_lanh_banner_2ea790831c.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.35)',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 60px 60px', width: '100%' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', margin: '0 0 16px 0' }}>
            Sản Phẩm Mới - Công Nghệ Đỉnh Cao
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'white', marginBottom: '24px', opacity: 0.95, maxWidth: '600px', lineHeight: 1.5 }}>
            Khám phá những thiết bị công nghệ mới nhất với thiết kế tinh xảo và hiệu năng vượt trội.
          </p>
          <Button type="primary" size="large" style={{ fontSize: '1rem', paddingLeft: '32px', paddingRight: '32px', height: '48px' }}>
            <Link style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }} to="/products">
              Khám Phá Ngay <ArrowRightOutlined />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeCarousel;