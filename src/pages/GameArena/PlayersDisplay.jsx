import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Text } = Typography;

const PlayersDisplay = ({ currentUser, opponent }) => {
  return (
    <Card>
      <Row gutter={24} align="middle">
        <Col span={8} style={{ textAlign: 'center' }}>
          <div className="player-card">
            <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
              {currentUser} (You)
            </Text>
          </div>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <div className="vs-divider">VS</div>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <div className="player-card">
            <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
              {opponent}
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PlayersDisplay;