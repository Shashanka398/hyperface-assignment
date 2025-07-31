import React from 'react';
import { Alert, Result, Button, Space, Typography, Card } from 'antd';
import { 
  ExclamationCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  ReloadOutlined,
  HomeOutlined,
  WifiOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const Error = ({
  type = 'alert',
  severity = 'error', 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showIcon = true,
  closable = false,
  actions = null,
  onRetry = null,
  onHome = null,
  className = '',
  style = {},
  ...props
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningOutlined style={{ color: 'var(--warning-color)' }} />;
      case 'info':
        return <ExclamationCircleOutlined style={{ color: 'var(--primary-color)' }} />;
      case 'error':
      default:
        return <CloseCircleOutlined style={{ color: 'var(--error-color)' }} />;
    }
  };

  const defaultActions = [];
  if (onRetry) {
    defaultActions.push(
      <Button 
        key="retry" 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={onRetry}
      >
        Try Again
      </Button>
    );
  }
  if (onHome) {
    defaultActions.push(
      <Button 
        key="home" 
        icon={<HomeOutlined />} 
        onClick={onHome}
      >
        Go Home
      </Button>
    );
  }

  const finalActions = actions || (defaultActions.length > 0 ? defaultActions : null);

  if (type === 'alert') {
    return (
      <Alert
        type={severity}
        message={title}
        description={message}
        showIcon={showIcon}
        closable={closable}
        className={`error-alert ${className}`}
        style={style}
        action={finalActions && (
          <Space direction="vertical" size="small">
            {finalActions}
          </Space>
        )}
        {...props}
      />
    );
  }

  if (type === 'result') {
    const resultStatus = severity === 'warning' ? 'warning' : severity === 'info' ? 'info' : 'error';
    
    return (
      <div className={`error-result ${className}`} style={{ padding: '40px 20px', textAlign: 'center', ...style }}>
        <Result
          status={resultStatus}
          title={title}
          subTitle={message}
          extra={finalActions}
          {...props}
        />
      </div>
    );
  }

  // Card Error
  if (type === 'card') {
    return (
      <Card className={`error-card ${className}`} style={style}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {showIcon && (
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {getIcon()}
            </div>
          )}
          <Typography.Title level={4} type={severity === 'error' ? 'danger' : undefined}>
            {title}
          </Typography.Title>
          <Paragraph type="secondary">
            {message}
          </Paragraph>
          {finalActions && (
            <Space style={{ marginTop: '16px' }}>
              {finalActions}
            </Space>
          )}
        </div>
      </Card>
    );
  }

  // Simple Error (minimal)
  if (type === 'simple') {
    return (
      <div className={`error-simple ${className}`} style={{ textAlign: 'center', padding: '20px', ...style }}>
        <Space direction="vertical" size="small">
          {showIcon && getIcon()}
          <Text type={severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : undefined}>
            {title}
          </Text>
          {message && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {message}
            </Text>
          )}
          {finalActions && (
            <Space size="small">
              {finalActions}
            </Space>
          )}
        </Space>
      </div>
    );
  }

  // Inline Error (compact)
  if (type === 'inline') {
    return (
      <div className={`error-inline ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
        {showIcon && getIcon()}
        <Text type={severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : undefined}>
          {title}
        </Text>
        {finalActions && (
          <Space size="small" style={{ marginLeft: 'auto' }}>
            {finalActions}
          </Space>
        )}
      </div>
    );
  }

  if (type === 'fullscreen') {
    return (
      <div 
        className={`error-fullscreen ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          zIndex: 9999,
          ...style
        }}
      >
        <Result
          status={severity === 'warning' ? 'warning' : 'error'}
          title={title}
          subTitle={message}
          extra={finalActions}
          {...props}
        />
      </div>
    );
  }

  return (
    <Alert
      type={severity}
      message={title}
      description={message}
      showIcon={showIcon}
      className={className}
      style={style}
      {...props}
    />
  );
};

export const NetworkError = ({ onRetry, ...props }) => (
  <Error
    type="result"
    severity="error"
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    {...props}
  />
);

export const NotFoundError = ({ onHome, ...props }) => (
  <Error
    type="result"
    severity="warning"
    title="Page Not Found"
    message="The page you are looking for doesn't exist or has been moved."
    onHome={onHome}
    {...props}
  />
);

export const AccessDeniedError = ({ onHome, ...props }) => (
  <Error
    type="result"
    severity="error"
    title="Access Denied"
    message="You don't have permission to access this resource."
    onHome={onHome}
    {...props}
  />
);

export const ValidationError = ({ errors = [], ...props }) => (
  <Error
    type="alert"
    severity="warning"
    title="Validation Error"
    message={
      <ul style={{ margin: 0, paddingLeft: '16px' }}>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    }
    {...props}
  />
);

export const InlineError = (props) => (
  <Error
    type="inline"
    severity="error"
    showIcon={true}
    {...props}
  />
);

export const CardError = ({ onRetry, ...props }) => (
  <Error
    type="card"
    severity="error"
    onRetry={onRetry}
    {...props}
  />
);

export const SimpleError = (props) => (
  <Error
    type="simple"
    severity="error"
    {...props}
  />
);

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Error
          type="result"
          severity="error"
          title="Something went wrong"
          message="An unexpected error occurred. The page will reload automatically."
          onRetry={() => window.location.reload()}
          {...this.props.errorProps}
        />
      );
    }

    return this.props.children;
  }
}

export default Error;
