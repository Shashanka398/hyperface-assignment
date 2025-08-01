import React from 'react';
import { Button, Row, Col, Typography } from 'antd';
import GameChoiceDisplay from './GameChoiceDisplay';
import { GAME_RESULTS, NOTIFICATION_MESSAGES } from '../../constants/common.constants';

const { Text } = Typography;

const GameResults = ({ 
  playerChoice, 
  opponentChoice, 
  choices, 
  gameResult, 
  currentUser, 
  opponent, 
  onReturnToLobby 
}) => {
  const getResultText = () => {
    if (!gameResult) return null;
    
    if (gameResult === currentUser) {
      return { text: NOTIFICATION_MESSAGES.YOU_WIN, color: 'var(--success-color)' };
    } else if (gameResult === GAME_RESULTS.DRAW) {
      return { text: NOTIFICATION_MESSAGES.ITS_A_DRAW, color: 'var(--warning-color)' };
    } else {
      return { text: NOTIFICATION_MESSAGES.YOU_LOSE, color: 'var(--error-color)' };
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Row gutter={24} style={{ marginBottom: '32px' }}>
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

      <div style={{ marginBottom: '24px' }}>
        <Text style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: getResultText()?.color,
          display: 'block'
        }}>
          {getResultText()?.text}
        </Text>
      </div>

      <Button type="primary" size="large" onClick={onReturnToLobby}>
        Return to Lobby
      </Button>
    </div>
  );
};

export default GameResults;