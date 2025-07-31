import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLogin } from '../hooks/useLogin';
import { Error, ButtonLoading } from '../components/ui';

const { Title, Text } = Typography;

const Login = () => {
  const [username, setUsername] = useState('');
  const { handleLogin, isLoading, error, clearError } = useLogin();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(username);
  };

  const handleInputChange = (e) => {
    setUsername(e.target.value);
    if (error) clearError();
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} className="login-title">
              🎮 Join the Game
            </Title>
            <Text type="secondary" className="login-subtitle">
              Enter a unique username to start playing Rock Paper Scissors
            </Text>
          </div>
          {error && (
            <Error
              type="alert"
              severity="error"
              title={error}
              closable
              onClose={clearError}
            />
          )}
          
          <form onSubmit={onSubmit}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="form-group">
                <Input
                  size="large"
                  placeholder="Enter your username"
                  prefix={<UserOutlined />}
                  value={username}
                  onChange={handleInputChange}
                  maxLength={20}
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              
              <ButtonLoading spinning={isLoading}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={!username.trim() || isLoading}
                  style={{ width: '100%' }}
                >
                  {isLoading ? 'Joining...' : 'Join Game'}
                </Button>
              </ButtonLoading>
            </Space>
          </form>
          
          <div className="login-rules">
            <Title level={5}>Game Rules:</Title>
            <ul style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
              <li>Rock beats Scissors</li>
              <li>Scissors beats Paper</li>
              <li>Paper beats Rock</li>
              <li>Each tab is a separate player</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
