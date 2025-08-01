import React from 'react';
import { Card, Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

const GameHeader = ({ onBack, canGoBack = true }) => {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back to Lobby
        </Button>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
          Rock Paper Scissors
        </Title>
        <div />
      </div>
    </Card>
  );
};

export default GameHeader;