import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, message } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { gameState } from '../utils/gameState';
import { crossTabSync } from '../utils/crossTabSync';
import { PageLoading, Error } from '../components/ui';
import {
  GameHeader,
  PlayersDisplay,
  ChoiceSelector,
  WaitingDisplay,
  GameResults
} from './GameArena';
import {choices,ERROR_MESSAGES,NOTIFICATION_MESSAGES,STORAGE_KEYS} from "../constants/common.constants"

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


  const loadGameSession = useCallback(() => {
    try {
      const session = gameState.getActiveGameSession(user.username) || 
                     Object.values(gameState.getState().gameSessions || {}).find(s => 
                       s.id === sessionId && s.players.includes(user.username)
                     );
      
      if (!session || session.id !== sessionId) {
        message.error(ERROR_MESSAGES.GAME_SESSION_NOT_FOUND);
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
      message.error(`${ERROR_MESSAGES.FAILED_TO_LOAD} , ${error?.message}` );
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
      message.success(NOTIFICATION_MESSAGES.GAME_CHOICE_DONE);
    } catch (err) {
      console.log(err);
      message.error(ERROR_MESSAGES.FAILED_TO_CHOICE);
      setPlayerChoice(null);
      setWaitingForOpponent(false);
    }
  };

  const returnToLobby = () => {
    gameState.cleanupCompletedGames();    
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.GAME_STATE,
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
          message={ERROR_MESSAGES.GAME_EXPIRED}
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
        <GameHeader 
          onBack={returnToLobby}
          canGoBack={gameSession.status !== 'active' || gameResult}
        />

        <PlayersDisplay 
          currentUser={user.username}
          opponent={opponent}
        />

        <Card title={gameResult ? "Game Results" : "Make Your Choice"}>
          {!gameResult ? (
            !playerChoice ? (
              <ChoiceSelector
                choices={choices}
                onChoiceSelect={makeChoice}
                disabled={waitingForOpponent}
                loading={waitingForOpponent}
              />
            ) : (
              <WaitingDisplay
                playerChoice={playerChoice}
                opponentChoice={opponentChoice}
                choices={choices}
                currentUser={user.username}
                opponent={opponent}
                waitingForOpponent={waitingForOpponent}
              />
            )
          ) : (
            <GameResults
              playerChoice={playerChoice}
              opponentChoice={opponentChoice}
              choices={choices}
              gameResult={gameResult}
              currentUser={user.username}
              opponent={opponent}
              onReturnToLobby={returnToLobby}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Game;
