import React from 'react';
import { Card, Badge, Button, Typography, Space, Tag } from 'antd';
import { UserOutlined, PlayCircleFilled, PauseCircleFilled,TrophyOutlined } from '@ant-design/icons';
import { formatJoinTime } from '../../utils/common-util';
import { gameState } from '../../utils/gameState';

const { Text } = Typography;

const PlayerCard = ({ player, onClick, currentUser, isInGame = false }) => {
  const isCurrentUser = currentUser?.username === player.username;
  
  const getStatusColor = () => {
    if (!player.isOnline) return 'default';
    return 'success';
  };

  const handleChallengeClick = (e) => {
    e.stopPropagation();
    onClick?.(player);
  };

  return (
    <Card 
      className="player-card"
      size="small"
      hoverable={!isCurrentUser}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Badge 
              status={getStatusColor()} 
              dot 
              style={{ fontSize: '8px' }}
            />
            <UserOutlined style={{ color: 'var(--text-secondary)' }} />
            <Text strong style={{ color: 'var(--text-primary)' }}>
              {player.username}
              {isCurrentUser && ' (You)'}
            </Text>
            {isInGame && (
              <Tag color="orange" size="small" icon={<PauseCircleFilled />}>
                In Game
              </Tag>
            )}
          </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {formatJoinTime(player.joinedAt)}
          </Text>
          {!isCurrentUser && (
            <Button 
              type={isInGame ? "default" : "primary"}
              size="small"
              onClick={(e) => {
                handleChallengeClick(e);
              }}
            >
              {isInGame ? (
                <>
                  <PauseCircleFilled /> Join Queue
                </>
              ) : (
                <>
                  <PlayCircleFilled /> Challenge
                </>
              )}
            </Button>
          )}
        </div>
      </Space>
    </Card>
  );
};

const OnlinePlayers = ({ onlinePlayers, onClick, currentUser }) => {
  const otherPlayers = onlinePlayers
    .filter((player) => player.username !== currentUser.username)
    .map((player) => ({
      ...player,
      isPlayerInGame: gameState.isPlayerInActiveGame(player.username)
    }));

    
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      {otherPlayers.map((player) => (
        <PlayerCard
          key={player.username}
          player={player}
          onClick={onClick}
          currentUser={currentUser}
          isInGame={player.isPlayerInGame}
        />
      ))}
    </Space>
  );
};




export default OnlinePlayers;