import React from 'react';
import { Layout, Switch, Space, Typography } from 'antd';
import { MoonFilled, SunFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './BaseLayout.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const BaseLayout = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Layout className="base-layout">
      <Header className="base-header">
        <div className="header-container">
          <div className="header-left">
            <Title level={2} className="app-title">
              🎮  Hyper Clash
            </Title>
          </div>
          
          <div className="header-right">
            <Space align="center" size="middle">
              <Space align="center" size="small">
                <Switch
                  checked={isDark}
                  onChange={toggleTheme}
                  checkedChildren={<MoonFilled />}
                  unCheckedChildren={<SunFilled />}
                  size="default"
                />
              </Space>
            </Space>
          </div>
        </div>
      </Header>
      
      <Content className="base-content">
        <div className="content-container">
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default BaseLayout;
