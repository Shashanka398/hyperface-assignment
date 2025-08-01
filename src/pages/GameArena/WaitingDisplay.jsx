import React from 'react';
import { Row, Col, Typography } from 'antd';
import GameChoiceDisplay from './GameChoiceDisplay';
import { NOTIFICATION_MESSAGES } from '../../constants/common.constants';

const { Text } = Typography;

const WaitingDisplay = ({ 
  playerChoice, 
  opponentChoice, 
  choices, 
  currentUser, 
  opponent, 
  waitingForOpponent 
}) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <Text style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
        {waitingForOpponent ? NOTIFICATION_MESSAGES.GAME_CHOICE_DONE : NOTIFICATION_MESSAGES.GAME_COMPLETED}
      </Text>
      
      {opponentChoice && (
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <GameChoiceDisplay 
              choice={playerChoice}
              choices={choices}
              label="You chose:"
            />
          </Col>
          <Col span={8} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="vs-divider">VS</div>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <GameChoiceDisplay 
              choice={opponentChoice}
              choices={choices}
              label={`${opponent} chose:`}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default WaitingDisplay;