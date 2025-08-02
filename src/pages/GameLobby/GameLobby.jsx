import React, { useState, useEffect } from "react";
import { Card, Typography, Space, message, Badge } from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { gameState } from "../../utils/gameState";
import { crossTabSync } from "../../utils/crossTabSync";
import { useChallengeNotifications } from "../../components/ui/ChallengeNotification";
import {
  PageLoading,
  CardLoading,
  InlineError,
  CardEmptyState,
  OverlayLoading,
} from "../../components/ui";
import { TIME_CONSTANTS, ERROR_MESSAGES, NOTIFICATION_MESSAGES, STORAGE_KEYS } from "../../constants/common.constants.js";
import OnlinePlayers from "./OnlinePlayer";
import LeaderBoard from "./LeaderBoard";
import PendingChallenges from "./PendingChallenges";
import WaitingQueue from "./WaitingQueue";
import WelcomeCard from "./WelcomeCard";

const { Text } = Typography;

const GameLobby = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  const { pendingChallenges } = useChallengeNotifications(
    user,
    gameState,
    crossTabSync
  );
  useEffect(() => {
    loadGameData();

    if (user) {
      const activeSession = gameState.getActiveGameSession(user.username);
      if (activeSession) {
        message.info(NOTIFICATION_MESSAGES.GAME_STARTED);
        navigate(`/game/${activeSession.id}`);
        return;
      }
    }

    const unsubscribe = crossTabSync.subscribe(() => {
      gameState.cleanupCompletedGames();
      loadGameData();

      if (user) {
        const activeSession = gameState.getActiveGameSession(user.username);
        if (activeSession) {
          setTimeout(() => {
            message.success(NOTIFICATION_MESSAGES.CHALLENGE_ACCEPTED);
            window.location.href = `/game/${activeSession.id}`;
          }, 100);
        }
      }
    });

    const handleFocus = () => {
      loadGameData();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadGameData();
      gameState.cleanupExpiredChallenges();
      gameState.cleanupCompletedGames();
      setRefreshKey((prev) => prev + 1);
    }, TIME_CONSTANTS.DATA_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkGameSession = () => {
      const activeSession = gameState.getActiveGameSession(user.username);
      if (activeSession) {
        message.info(NOTIFICATION_MESSAGES.GAME_STARTED);
        window.location.href = `/game/${activeSession.id}`;
      }
    };
    checkGameSession();
    const gameSessionInterval = setInterval(
      checkGameSession,
      TIME_CONSTANTS.GAME_SESSION_CHECK_INTERVAL
    );
    return () => clearInterval(gameSessionInterval);
  }, [user?.username]);

  const loadGameData = async () => {
    try {
      setLoadError(null);
      gameState.cleanupCompletedGames();
      const players = gameState.getOnlinePlayers();
      const leaderboardData = gameState.getLeaderboard();
      const queueData = gameState.getWaitingQueue();
      setOnlinePlayers(players);
      setLeaderboard(leaderboardData);
      setWaitingQueue(queueData);
    } catch (error) {
      console.error("Failed to load game data:", error);
      setLoadError("Failed to load game data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallengePlayer = async (player) => {
    try {
      setChallengeLoading(true);
      const challenge = gameState.createChallenge(
        user.username,
        player.username
      );

      message.success({
        content: NOTIFICATION_MESSAGES.CHALLENGE_SENT,
        duration: 3,
      });

      setTimeout(() => {
        const state = gameState.getState();
        const currentChallenge = state.challenges?.[challenge.id];
        if (currentChallenge && currentChallenge.status === "pending") {
          message.info(ERROR_MESSAGES.CHALLENGE_EXPIRED);
        } else if (currentChallenge && currentChallenge.status === "accepted") {
          message.success(NOTIFICATION_MESSAGES.CHALLENGE_ACCEPTED);
        }
      }, 2 * 60 * 1000);
    } catch (error) {
      message.error({
        content: error.message,
        duration: 3,
      });
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const result = gameState.acceptChallenge(challengeId, user.username);
      message.success(NOTIFICATION_MESSAGES.CHALLENGE_ACCEPTED);
      navigate(`/game/${result.gameSessionId}`);
      setTimeout(() => {
        const currentState = gameState.getState();
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: STORAGE_KEYS.GAME_STATE,
            newValue: JSON.stringify(currentState),
          })
        );
      }, 100);
    } catch (error) {
      message.error(`${ERROR_MESSAGES.CHALLENGE_NOT_FOUND}: ${error.message}`);
    }
  };

  const handleRejectChallenge = async (challengeId) => {
    try {
      gameState.rejectChallenge(challengeId, user.username);
      message.info(NOTIFICATION_MESSAGES.CHALLENGE_REJECTED);
    } catch (error) {
      message.error(`${ERROR_MESSAGES.CHALLENGE_NOT_FOUND}: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="game-container">
        <PageLoading message="Loading game lobby..." />
      </div>
    );
  }

  return (
    <div className="game-container">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <WelcomeCard />

        {loadError && (
          <InlineError
            title={loadError}
            onRetry={() => {
              setIsLoading(true);
              loadGameData();
            }}
          />
        )}
        <div
          className="lobby-container"
        >
          <Card
            title={
              <Space>
                <UsergroupAddOutlined />
                <span>
                  Players Online <Badge count={onlinePlayers.length - 1} />
                </span>
              </Space>
            }
            size="large"
          >
            <OverlayLoading
              spinning={challengeLoading}
              message="Sending challenge..."
            >
              <Space
                direction="vertical"
                style={{ width: "100%", height: "100%" }}
              >
                <div style={{ overflowY: "auto" }}>
                  <Space
                    direction="vertical"
                    style={{
                      width: "100%",
                      maxHeight: "600px",
                      padding: "16px",
                    }}
                    size="small"
                  >
                  {
                    onlinePlayers.length > 1 ? (
                      <OnlinePlayers
                        onlinePlayers={onlinePlayers}
                        onClick={handleChallengePlayer}
                        currentUser={user}
                      />
                    ) : (
                      <CardEmptyState 
                        title="No players online"
                        discription="Please wait for some time some warrior may come"
                        icon={<UserOutlined />}
                      />
                    )
                  }
                  
                  </Space>
                </div>
              </Space>
            </OverlayLoading>
          </Card>
          <Space direction="vertical">
                {/* Challenges & queue */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span> Challenges & Queue</span>
                </Space>
              }
            >
              <div style={{ height: "300px", overflowY: "auto" }}>
                <PendingChallenges
                  pendingChallenges={pendingChallenges}
                  onAcceptChallenge={handleAcceptChallenge}
                  onRejectChallenge={handleRejectChallenge}
                />
                <WaitingQueue waitingQueue={waitingQueue} currentUser={user} />
                {pendingChallenges.length === 0 &&
                  waitingQueue.filter(
                    (q) =>
                      q.waitingPlayer === user?.username ||
                      q.targetPlayer === user?.username
                  ).length === 0 && (
                    <CardEmptyState 
                      title="No pending challenges"
                      discription="Challenge other players to start a game!"
                      icon={<ClockCircleOutlined />}
                    />
                  )}
              </div>
            </Card>
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span> Leaderboard</span>
                </Space>
              }
            >
              <div
                style={{
                  height: "300px",
                  overflowY: "auto",
                  padding: "16px",
                }}
              >
                 <LeaderBoard leaderboard={leaderboard} currentUser={user} />
              </div>
            </Card>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default GameLobby;
