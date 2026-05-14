// src/Pages/HomePage.jsx

import React from 'react';
import { Layout } from 'antd';
import HomeCarousel from '../Components/homepage/HomeCarousel';
import HomeBody from '../Components/homepage/HomeBody';
import HomeFooter from '../Components/homepage/HomeFooter';

const { Content } = Layout;

const HomePage = () => {
  return (
    <Layout>
      <Content>
        <HomeCarousel />
        <div className="px-4 md:px-12">
            <HomeBody />
        </div>
      </Content>
      <HomeFooter />
    </Layout>
  );
};

export default HomePage;