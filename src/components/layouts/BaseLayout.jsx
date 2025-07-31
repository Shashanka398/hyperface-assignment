import React from 'react';
import { Layout, Switch, Space, Typography } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
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
              🎮 Rock Paper Scissors
            </Title>
          </div>
          
          <div className="header-right">
            <Space align="center" size="middle">
              <Space align="center" size="small">
                <BulbOutlined style={{ color: isDark ? '#faad14' : '#1890ff' }} />
                <Switch
                  checked={isDark}
                  onChange={toggleTheme}
                  checkedChildren={<BulbFilled />}
                  unCheckedChildren={<BulbOutlined />}
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
