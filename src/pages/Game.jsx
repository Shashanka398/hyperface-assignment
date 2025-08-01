import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Space, message } from "antd";
import { useAuth } from "../hooks/useAuth";
import { gameState } from "../utils/gameState";
import { crossTabSync } from "../utils/crossTabSync";
import { PageLoading, Error, Rules } from "../components/ui";
import {
  GameHeader,
  PlayersDisplay,
  ChoiceSelector,
  WaitingDisplay,
  GameResults,
} from "./GameArena";
import {
  choices,
  GAME_SESSION_STATUS,
  ERROR_MESSAGES,
  NOTIFICATION_MESSAGES,
  STORAGE_KEYS,
} from "../constants/common.constants";

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
  const [replayRequestSent, setReplayRequestSent] = useState(false);
  const [replayRequestReceived, setReplayRequestReceived] = useState(false);

  const loadGameSession = useCallback(() => {
    try {
      const session =
        gameState.getActiveGameSession(user.username) ||
        Object.values(gameState.getState().gameSessions || {}).find(
          (s) => s.id === sessionId && s.players.includes(user.username)
        );

      if (!session || session.id !== sessionId) {
        message.error(ERROR_MESSAGES.GAME_SESSION_NOT_FOUND);
        navigate("/lobby");
        return;
      }
      setGameSession(session);
      setLoading(false);
      if (session.status === GAME_SESSION_STATUS.ACTIVE) {
        const opponent = session.players.find((p) => p !== user.username);
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
      } else if (session.status === GAME_SESSION_STATUS.COMPLETED) {
        const opponent = session.players.find((p) => p !== user.username);
        setPlayerChoice(session.choices[user.username]);
        setOpponentChoice(session.choices[opponent]);
        setGameResult(session.winner || "draw");
        setWaitingForOpponent(false);
      }
      if (session.replayChallenge) {
        const opponent = session.players.find((p) => p !== user.username);
        const challengeId = session.replayChallenge.challengeId;
        const currentState = gameState.getState();
        const challenge = currentState.challenges?.[challengeId];
        if (!challenge) {
          const updatedSession = { ...session, replayChallenge: null };
          const newState = {
            ...currentState,
            gameSessions: {
              ...currentState.gameSessions,
              [sessionId]: updatedSession,
            },
          };
          gameState.setState(newState);
          setReplayRequestSent(false);
          setReplayRequestReceived(false);
        } else if (
          session.replayChallenge.from === opponent &&
          session.replayChallenge.to === user.username
        ) {
          setReplayRequestReceived(true);
          setReplayRequestSent(false);
        } else if (
          session.replayChallenge.from === user.username &&
          session.replayChallenge.to === opponent
        ) {
          setReplayRequestSent(true);
          setReplayRequestReceived(false);
        }
      } else {
        setReplayRequestSent(false);
        setReplayRequestReceived(false);
      }
    } catch (error) {
      message.error(`${ERROR_MESSAGES.FAILED_TO_LOAD} , ${error?.message}`);
      navigate("/lobby");
    }
  }, [user, sessionId, navigate, playerChoice, opponentChoice]);

  useEffect(() => {
    if (!sessionId || !user) {
      navigate("/lobby");
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
    const state = gameState.getState();
    const session = state.gameSessions[sessionId];
    const challengeId = session.replayChallenge?.challengeId;
    if (challengeId) {
      handleDeclineReplay();
    }
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEYS.GAME_STATE,
        newValue: JSON.stringify(gameState.getState()),
        oldValue: null,
      })
    );
    navigate("/lobby");
  };

  const handleRequestReplay = () => {
    try {
      const state = gameState.getState();
      const session = state.gameSessions[sessionId];
      const opponent = session.players.find((p) => p !== user.username);
      const challenge = gameState.createChallenge(user.username, opponent);
      const updatedState = gameState.getState();
      const currentSession = updatedState.gameSessions[sessionId];
      const updatedSession = {
        ...currentSession,
        replayChallenge: {
          challengeId: challenge.id,
          from: user.username,
          to: opponent,
          timestamp: Date.now(),
        },
      };

      const newState = {
        ...updatedState,
        gameSessions: {
          ...updatedState.gameSessions,
          [sessionId]: updatedSession,
        },
      };

      gameState.setState(newState);
      setReplayRequestSent(true);
      message.success(`Replay request sent to ${opponent}`);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEYS.GAME_STATE,
          newValue: JSON.stringify(newState),
          oldValue: JSON.stringify(updatedState),
        })
      );
    } catch (error) {
      message.error(`Failed to send replay request: ${error.message}`);
    }
  };

  const handleAcceptReplay = () => {
    try {
      const state = gameState.getState();
      const session = state.gameSessions[sessionId];
      const challengeId = session.replayChallenge?.challengeId;

      if (!challengeId) {
        throw new Error("No replay challenge found in session");
      }
      const challenge = state.challenges?.[challengeId];
      if (!challenge) {
        throw new Error(
          `Challenge ${challengeId} not found in challenges list`
        );
      }
      const result = gameState.acceptChallenge(challengeId, user.username);
      const newSessionId = result.gameSessionId;
      const updatedState = gameState.getState();
      const currentSession = updatedState.gameSessions[sessionId];

      const updatedSession = {
        ...currentSession,
        replayChallenge: null,
      };

      const newState = {
        ...updatedState,
        gameSessions: {
          ...updatedState.gameSessions,
          [sessionId]: updatedSession,
        },
      };

      gameState.setState(newState);
      message.success("Replay accepted! Starting new game...");
      navigate(`/game/${newSessionId}`);

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEYS.GAME_STATE,
          newValue: JSON.stringify(gameState.getState()),
          oldValue: JSON.stringify(updatedState),
        })
      );
    } catch (error) {
      console.error("Failed to accept replay request:", error);
      message.error(`Failed to accept replay request: ${error.message}`);
    }
  };

  const handleDeclineReplay = () => {
    try {
      const state = gameState.getState();
      const session = state.gameSessions[sessionId];
      const challengeId = session.replayChallenge?.challengeId;
      const opponent = session.players.find((p) => p !== user.username);
      if (challengeId) {
        gameState.rejectChallenge(challengeId, user.username);
      }
      const updatedSession = {
        ...session,
        replayChallenge: null,
      };

      const newState = {
        ...state,
        gameSessions: {
          ...state.gameSessions,
          [sessionId]: updatedSession,
        },
      };

      gameState.setState(newState);
      setReplayRequestReceived(false);
      message.info(`Replay request from ${opponent} declined`);

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEYS.GAME_STATE,
          newValue: JSON.stringify(newState),
          oldValue: null,
        })
      );
    } catch (error) {
      console.error("Failed to decline replay request:", error);
      message.error("Failed to decline replay request");
    }
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
            </Button>,
          ]}
        />
      </div>
    );
  }

  const opponent = gameSession.players.find((p) => p !== user.username);

  return (
    <div className="game-container">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <GameHeader
          onBack={returnToLobby}
          canGoBack={gameSession.status !== "active" || gameResult}
        />

        <PlayersDisplay currentUser={user.username} opponent={opponent} />

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
              replayRequestSent={replayRequestSent}
              replayRequestReceived={replayRequestReceived}
              onRequestReplay={handleRequestReplay}
              onAcceptReplay={handleAcceptReplay}
              onDeclineReplay={handleDeclineReplay}
            />
          )}
        </Card>
        <Card>
          <div style={{ padding: "24px" }}>
            <Rules />
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default Game;
