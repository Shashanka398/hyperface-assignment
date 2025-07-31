import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Row, Col, message, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { gameState } from '../utils/gameState';
import { crossTabSync } from '../utils/crossTabSync';
import { PageLoading, Error, OverlayLoading } from '../components/ui';

const { Title, Text } = Typography;

const Game = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  const choices = [
    { id: 'rock', emoji: '🪨', name: 'Rock' },
    { id: 'paper', emoji: '📄', name: 'Paper' },
    { id: 'scissors', emoji: '✂️', name: 'Scissors' }
  ];

  const loadGameSession = useCallback(() => {
    try {
      const session = gameState.getActiveGameSession(user.username) || 
                     Object.values(gameState.getState().gameSessions || {}).find(s => 
                       s.id === sessionId && s.players.includes(user.username)
                     );
      
      if (!session || session.id !== sessionId) {
        message.error('Game session not found or you are not part of this game');
        navigate('/lobby');
        return;
      }
      setGameSession(session);
      setLoading(false);
      if (session.status === 'active') {
        const opponent = session.players.find(p => p !== user.username);
        const userChoice = session.choices[user.username];
        const opponentChoiceFromSession = session.choices[opponent];
        if (userChoice && !playerChoice) {
          setPlayerChoice(userChoice);
          setWaitingForOpponent(true);
        }
        
        if (opponentChoiceFromSession && !opponentChoice) {
          setOpponentChoice(opponentChoiceFromSession);
          setWaitingForOpponent(false);
        }
      
      } else if (session.status === 'completed') {
        const opponent = session.players.find(p => p !== user.username);
        setPlayerChoice(session.choices[user.username]);
        setOpponentChoice(session.choices[opponent]);
        setGameResult(session.winner || 'draw');
        setWaitingForOpponent(false);
      }
    } catch (error) {
      message.error(`Failed to load game session , ${error?.message}` );
      navigate('/lobby');
    }
  }, [user, sessionId, navigate, playerChoice, opponentChoice]);

  useEffect(() => {
    if (!sessionId || !user) {
      navigate('/lobby');
      return;
    }

    loadGameSession();

    const unsubscribe = crossTabSync.subscribe(() => {
      loadGameSession();
    });

    return unsubscribe;
  }, [sessionId, user, navigate, loadGameSession]);

  const makeChoice = async (choice) => {
    if (playerChoice || waitingForOpponent) return;

    setPlayerChoice(choice);
    setWaitingForOpponent(true);

    try {
      gameState.makePlayerChoice(sessionId, user.username, choice);
      message.success('Choice made! Waiting for opponent...');
    } catch (err) {
      console.error('Failed to make choice:', err);
      message.error('Failed to make choice');
      setPlayerChoice(null);
      setWaitingForOpponent(false);
    }
  };

  const getResultText = () => {
    if (!gameResult) return null;
    
    if (gameResult === user.username) {
      return { text: 'You Win!', color: 'var(--success-color)' };
    } else if (gameResult === 'draw') {
      return { text: 'It\'s a Draw!', color: 'var(--warning-color)' };
    } else {
      return { text: 'You Lose!', color: 'var(--error-color)' };
    }
  };

  const returnToLobby = () => {
    gameState.cleanupCompletedGames();    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'rps_game_state',
      newValue: JSON.stringify(gameState.getState()),
      oldValue: null
    }));
    navigate('/lobby');
  };

  if (loading) {
    return (
      <div className="game-container">
        <PageLoading message="Loading game session..." />
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="game-container">
        <Error
          type="result"
          severity="warning"
          title="Game Session Not Found"
          message="The game session you're looking for doesn't exist or has expired."
          actions={[
            <Button key="lobby" type="primary" onClick={returnToLobby}>
              Return to Lobby
            </Button>
          ]}
        />
      </div>
    );
  }

  const opponent = gameSession.players.find(p => p !== user.username);

  return (
    <div className="game-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={returnToLobby}
              disabled={gameSession.status === 'active' && !gameResult}
            >
              Back to Lobby
            </Button>
            <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
              Rock Paper Scissors
            </Title>
            <div />
          </div>
        </Card>

        <Card>
          <Row gutter={24} align="middle">
            <Col span={8} style={{ textAlign: 'center' }}>
              <div className="player-card">
                <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                  {user.username} (You)
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

        <Card title={gameResult ? "Game Results" : "Make Your Choice"}>
          {!gameResult ? (
            !playerChoice ? (
              <div className="choices-grid">
                {choices.map(choice => (
                  <OverlayLoading spinning={waitingForOpponent} message="Processing choice...">
                    <Button
                      key={choice.id}
                      className={`game-choice-btn ${choice.id}`}
                      onClick={() => makeChoice(choice.id)}
                      disabled={waitingForOpponent}
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '32px' }}>{choice.emoji}</span>
                      <span style={{ fontSize: '12px' }}>{choice.name}</span>
                    </Button>
                  </OverlayLoading>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
                  {waitingForOpponent ? 'Waiting for opponent...' : 'Game completed!'}
                </Text>
                
                {opponentChoice && (
                  <Row gutter={24} style={{ marginBottom: '24px' }}>
                    <Col span={8} style={{ textAlign: 'center' }}>
                      <div>
                        <Text>You chose:</Text>
                        <div style={{ fontSize: '48px', margin: '8px 0' }}>
                          {choices.find(c => c.id === playerChoice)?.emoji}
                        </div>
                        <Text>{choices.find(c => c.id === playerChoice)?.name}</Text>
                      </div>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="vs-divider">VS</div>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                      <div>
                        <Text>{opponent} chose:</Text>
                        <div style={{ fontSize: '48px', margin: '8px 0' }}>
                          {choices.find(c => c.id === opponentChoice)?.emoji}
                        </div>
                        <Text>{choices.find(c => c.id === opponentChoice)?.name}</Text>
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Row gutter={24} style={{ marginBottom: '32px' }}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div>
                    <Text>You chose:</Text>
                    <div style={{ fontSize: '48px', margin: '8px 0' }}>
                      {choices.find(c => c.id === playerChoice)?.emoji}
                    </div>
                    <Text>{choices.find(c => c.id === playerChoice)?.name}</Text>
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="vs-divider">VS</div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div>
                    <Text>{opponent} chose:</Text>
                    <div style={{ fontSize: '48px', margin: '8px 0' }}>
                      {choices.find(c => c.id === opponentChoice)?.emoji}
                    </div>
                    <Text>{choices.find(c => c.id === opponentChoice)?.name}</Text>
                  </div>
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

              <Button type="primary" size="large" onClick={returnToLobby}>
                Return to Lobby
              </Button>
            </div>
          )}
        </Card>


      </Space>
    </div>
  );
};

export default Game;
