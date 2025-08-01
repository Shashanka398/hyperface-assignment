import React from 'react';
import { Spin, Skeleton, Card, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Loading = ({ 
  type = 'spinner', 
  size = 'default', 
  message = 'Loading...',
  overlay = false,
  spinning = true,
  children,
  className = '',
  style = {},
  skeletonProps = {},
  ...props 
}) => {
  const customIcon = (
    <LoadingOutlined 
      style={{ 
        fontSize: size === 'large' ? 32 : size === 'small' ? 16 : 24,
        color: 'var(--primary-color)' 
      }} 
      spin 
    />
  );

  if (type === 'spinner') {
    if (overlay && children) {
      return (
        <Spin 
          spinning={spinning} 
          indicator={customIcon}
          tip={message}
          size={size}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </Spin>
      );
    }

    return (
      <div 
        className={`loading-container ${className}`}
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '40px 20px',
          ...style 
        }}
      >
        <Spin 
          indicator={customIcon}
          size={size}
          {...props}
        />
        {message && (
          <Text 
            type="secondary" 
            style={{ 
              marginTop: 16, 
              fontSize: size === 'large' ? 16 : size === 'small' ? 12 : 14 
            }}
          >
            {message}
          </Text>
        )}
      </div>
    );
  }

  if (type === 'skeleton') {
    const defaultSkeletonProps = {
      active: true,
      paragraph: { rows: 4 },
      ...skeletonProps
    };

    return (
      <div className={`loading-skeleton ${className}`} style={style}>
        <Skeleton {...defaultSkeletonProps} {...props} />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className={className}  bordered={false} style={style}>
        <Skeleton 
          loading={spinning}
          active
          avatar
          paragraph={{ rows: 3 }}
          {...skeletonProps}
          {...props}
        >
          {children}
        </Skeleton>
      </Card>
    );
  }

  if (type === 'list') {
    const listCount = skeletonProps.count || 3;
    return (
      <div className={`loading-list ${className}`} style={style}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {Array.from({ length: listCount }, (_, index) => (
            <Skeleton 
              key={index}
              active
              avatar
              paragraph={{ rows: 1 }}
              {...skeletonProps}
              {...props}
            />
          ))}
        </Space>
      </div>
    );
  }

  if (type === 'button') {
    return (
      <Spin 
        indicator={customIcon}
        size="small"
        spinning={spinning}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Spin>
    );
  }

  if (type === 'fullscreen') {
    return (
      <div 
        className={`loading-fullscreen ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          ...style
        }}
      >
        <Spin 
          indicator={customIcon}
          size="large"
          {...props}
        />
        {message && (
          <Text 
            type="secondary" 
            style={{ 
              marginTop: 24, 
              fontSize: 16,
              fontWeight: 500
            }}
          >
            {message}
          </Text>
        )}
      </div>
    );
  }

  return (
    <Spin 
      spinning={spinning}
      indicator={customIcon}
      tip={message}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Spin>
  );
};

export const PageLoading = (props) => (
  <Loading 
    type="spinner" 
    size="large" 
    message="Loading page..." 
    {...props} 
  />
);

export const CardLoading = (props) => (
  <Loading 
    type="card" 
    {...props} 
  />
);

export const ListLoading = (props) => (
  <Loading 
    type="list" 
    {...props} 
  />
);

export const ButtonLoading = (props) => (
  <Loading 
    type="button" 
    size="small" 
    {...props} 
  />
);

export const OverlayLoading = ({ children, ...props }) => (
  <Loading 
    type="spinner" 
    overlay 
    {...props}
  >
    {children}
  </Loading>
);

export const FullscreenLoading = (props) => (
  <Loading 
    type="fullscreen" 
    message="Please wait..." 
    {...props} 
  />
);

export default Loading;
