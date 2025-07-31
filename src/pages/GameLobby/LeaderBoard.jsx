import React from 'react';
import {  Typography, Space, Badge, Tag } from 'antd';
import { TrophyOutlined, UserOutlined } from '@ant-design/icons';
import {getRankIcon,getRankClass,getWinColor} from "../../utils/common-util"

const { Text } = Typography;

const LeaderBoard = ({ leaderboard, currentUser }) => {
 

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="empty-leaderboard">
          <TrophyOutlined style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <Text type="secondary" style={{ fontSize: '16px', display: 'block' }}>
            No players yet
          </Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Be the first to join and start playing!
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {leaderboard.slice(0, 10).map((player, index) => {
          const rank = index + 1;
          const isCurrentUser = currentUser?.username === player.username;
          
          return (
            <div 
              key={player.username} 
              className="leaderboard-item"
              style={{
                background: isCurrentUser ? 'var(--bg-secondary)' : 'transparent',
                border: isCurrentUser ? '1px solid var(--primary-color)' : 'none',
                borderRadius: isCurrentUser ? '8px' : '0',
                padding: isCurrentUser ? '12px 16px' : '12px 0'
              }}
            >
              <div className="player-info">
                <div className={`player-rank ${getRankClass(rank)}`}>
                  {getRankIcon(rank)}
                </div>
                
                <Space>
                  <Badge 
                    status={player.isOnline ? 'success' : 'default'} 
                    dot 
                    style={{ fontSize: '8px' }}
                  />
                  <UserOutlined style={{ color: 'var(--text-secondary)', fontSize: '14px' }} />
                  <Text 
                    className="player-name" 
                    strong={isCurrentUser}
                    style={{ 
                      color: isCurrentUser ? 'var(--primary-color)' : 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  >
                    {player.username}
                    {isCurrentUser && ' (You)'}
                  </Text>
                </Space>
              </div>

              <div className="player-stats">
                <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                  <Text 
                    className="player-score" 
                    style={{ 
                      color: getWinColor(player.wins),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {player.wins}  points
                  </Text>
                 
                </Space>
              </div>
            </div>
          );
        })}
        
        {leaderboard.length > 10 && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ... and {leaderboard.length - 10} more players
            </Text>
          </div>
        )}
      </Space>
    </div>
  );
};

export default LeaderBoard;
