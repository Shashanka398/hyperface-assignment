import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  message,
  Badge
} from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  UsergroupAddOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { gameState } from "../../utils/gameState";
import { crossTabSync } from "../../utils/crossTabSync";
import { useChallengeNotifications } from "../../components/ui/ChallengeNotification";
import { PageLoading, CardLoading, InlineError, OverlayLoading } from "../../components/ui";
import { TIME_CONSTANTS } from "../../constants/common.constants.js";
import OnlinePlayer from "./OnlinePlayer";
import LeaderBoard from "./LeaderBoard";
import PendingChallenges from "./PendingChallenges";
import WaitingQueue from "./WaitingQueue";
import WelcomeCard from "./WelcomeCard"

const {  Text } = Typography;

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

  const { pendingChallenges, requestPermission, showPushNotification } =
    useChallengeNotifications(user, gameState, crossTabSync);

  useEffect(() => {
    loadGameData();
    if (requestPermission) {
      requestPermission();
    }

    if (user) {
      const activeSession = gameState.getActiveGameSession(user.username);
      if (activeSession) {
        message.info("Continuing your active game...");
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
            message.success("Challenge accepted! Starting game...");
            window.location.href = `/game/${activeSession.id}`;
          }, 100);
        }
      }
    });

    const handleFocus = () => {
      loadGameData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
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
        message.info("Game session found! Joining...");
        window.location.href = `/game/${activeSession.id}`;
      }
    };
    checkGameSession();
    const gameSessionInterval = setInterval(checkGameSession, TIME_CONSTANTS.GAME_SESSION_CHECK_INTERVAL);
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
      console.error('Failed to load game data:', error);
      setLoadError('Failed to load game data. Please try again.');
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
        content: `Challenge sent to ${player.username}! They have 2 minutes to respond.`,
        duration: 3,
      });

      showPushNotification(
        "New Challenge!",
        `${user.username} wants to play Rock Paper Scissors with you!`,
        "/vite.svg"
      );

      setTimeout(() => {
        const state = gameState.getState();
        const currentChallenge = state.challenges?.[challenge.id];
        if (currentChallenge && currentChallenge.status === "pending") {
          message.info(`Challenge to ${player.username} expired.`);
        } else if (currentChallenge && currentChallenge.status === "accepted") {
          message.success(
            `${player.username} accepted your challenge! Starting game...`
          );
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
      message.success("Challenge accepted! Starting game...");
      navigate(`/game/${result.gameSessionId}`);
      setTimeout(() => {
        const currentState = gameState.getState();
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "rps_game_state",
            newValue: JSON.stringify(currentState),
          })
        );
      }, 100);
    } catch (error) {
      message.error(`Failed to accept challenge: ${error.message}`);
    }
  };



  const handleRejectChallenge = async (challengeId) => {
    try {
      gameState.rejectChallenge(challengeId, user.username);
      message.info("Challenge rejected.");
    } catch (error) {
      message.error(`Failed to reject challenge: ${error.message}`);
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
        <WelcomeCard/>
        
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
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
          }}
        >
          <Card
            title={
              <Space>
                <UsergroupAddOutlined />
                <span>Players Online   <Badge count={onlinePlayers.length - 1} /></span>
              </Space>
            }
            size="large"
          >
            <OverlayLoading spinning={challengeLoading} message="Sending challenge...">
              <Space
                direction="vertical"
                style={{ width: "100%", height: "100%" }}
              >
                <div style={{ overflowY: "auto" }}>
                  <Space
                    direction="vertical"
                    style={{ width: "100%" ,maxHeight: "600px" , padding:"16px"}}
                    size="small"
                  >
                    {onlinePlayers.filter((player)=>player.username !==user.username ).length > 0 ? (
                      onlinePlayers.filter((player)=>player.username !==user.username ).map((player) => {
                        const isPlayerInGame = gameState.isPlayerInActiveGame(player.username);
                        return (
                          <OnlinePlayer
                            key={player.username}
                            player={player}
                            currentUser={user}
                            isInGame={isPlayerInGame}
                            onClick={handleChallengePlayer}
                          />
                        );
                      })
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Text type="secondary">No other players online</Text>
                      </div>
                    )}
                  </Space>
                </div>
              </Space>
            </OverlayLoading>
          </Card>
          <Space direction="vertical">

            {/* LeaderBoard */}
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span> Leaderboard</span>
                </Space>
              }
            >
              <div style={{ maxHeight: "260px", overflowY: "auto", padding:"16px" }}>
                {leaderboard.length > 0 ? (
                  <LeaderBoard leaderboard={leaderboard} currentUser={user} />
                ) : (
                  <CardLoading skeletonProps={{ rows: 3, avatar: true }} />
                )}
              </div>
            </Card>

              {/* Challenges & queue */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span> Challenges & Queue</span>
                </Space>
              }
            >
              <div style={{ maxHeight: "60vh", overflowY: "auto"}}>
                <PendingChallenges 
                  pendingChallenges={pendingChallenges}
                  onAcceptChallenge={handleAcceptChallenge}
                  onRejectChallenge={handleRejectChallenge}
                />
                <WaitingQueue 
                  waitingQueue={waitingQueue}
                  currentUser={user}
                />
                {pendingChallenges.length === 0 && 
                 waitingQueue.filter(q => q.waitingPlayer === user?.username || q.targetPlayer === user?.username).length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">No pending challenges or waiting queue</Text>
                  </div>
                )}
              </div>
            </Card>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default GameLobby;
