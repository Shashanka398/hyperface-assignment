
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTheme } from './hooks/useTheme';
import  AuthProvider from './contexts/AuthContext.jsx';
import BaseLayout from './components/layouts/BaseLayout';
import AuthGuard from './components/auth/AuthGuard';
import Login from './pages/Login';
import GameLobby from './pages/GameLobby';
import './styles/components/game.css';
import './styles/components/forms.css';
import './styles/components/leaderboard.css';

function AppContent() {
  const { isDark } = useTheme();

  const antdConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      borderRadius: 8,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        headerBg: isDark ? '#1f1f1f' : '#f8f9fa',
        bodyBg: isDark ? '#141414' : '#ffffff',
      },
      Switch: {
        colorPrimary: '#1890ff',
        colorPrimaryHover: '#40a9ff',
      },
      Button: {
        borderRadius: 8,
        fontWeight: 500,
      },
      Card: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      Input: {
        borderRadius: 8,
      }
    }
  };

  return (
    <ConfigProvider theme={antdConfig}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <BaseLayout>
                    <Login />
                  </BaseLayout>
                </AuthGuard>
              } 
            />            
            <Route 
              path="/lobby" 
              element={
                <AuthGuard requireAuth={true}>
                  <BaseLayout>
                    <GameLobby />
                  </BaseLayout>
                </AuthGuard>
              } 
            />            
            <Route path="/" element={<Navigate to="/lobby" replace />} />            
            <Route path="*" element={<Navigate to="/lobby" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
