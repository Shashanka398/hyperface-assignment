import { notification } from "antd";
import {
  GAME_RESULTS,
  CHALLENGE_STATUS,
  GAME_SESSION_STATUS,
  GAME_CHOICES,
  WIN_CONDITIONS,
  STORAGE_KEYS,
  TIME_CONSTANTS,
  SCORE_POINTS,
  ERROR_MESSAGES,
  NOTIFICATION_MESSAGES,
  INITIAL_PLAYER_STATS,
  ID_PREFIXES,
  DEFAULT_STATE,
} from "../constants/common.constants.js";

class GameStateManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.GAME_STATE;
    this.init();
  }

  init() {
    const existing = this.getState();
    if (!existing.players) {
      this.setState({
        ...DEFAULT_STATE,
        lastUpdated: Date.now(),
      });
    }
  }

  getState() {
    try {
      const state = localStorage.getItem(this.storageKey);
      if (state) {
        const parsedState = JSON.parse(state);
        if (!parsedState.gameSessions) {
          parsedState.gameSessions = {};
        }
        return parsedState;
      }
      return {
        ...DEFAULT_STATE,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error("Error getting game state:", error);
      return {
        ...DEFAULT_STATE,
        lastUpdated: Date.now(),
      };
    }
  }

  setState(newState) {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          ...newState,
          lastUpdated: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error setting game state:", error);
    }
  }

  addPlayer(username, tabId) {
    const state = this.getState();

    if (state.players[username]) {
      throw new Error(ERROR_MESSAGES.USERNAME_TAKEN);
    }

    const newPlayer = {
      username,
      tabId,
      joinedAt: Date.now(),
      isOnline: true,
      stats: {
        ...INITIAL_PLAYER_STATS,
      },
    };

    const newState = {
      ...state,
      players: {
        ...state.players,
        [username]: newPlayer,
      },
    };

    this.setState(newState);
    this.updateLeaderboard();
    return newPlayer;
  }

  removePlayer(username) {
    const state = this.getState();
    const { [username]: _removed, ...remainingPlayers } = state.players;

    this.setState({
      ...state,
      players: remainingPlayers,
    });
    this.updateLeaderboard();
  }

  updatePlayerStats(username, gameResult) {
    const state = this.getState();
    const player = state.players[username];
    if (!player) return;
    const stats = { ...player.stats };
    stats.gamesPlayed++;
    switch (gameResult) {
      case GAME_RESULTS.WIN:
        stats.wins++;
        stats.winStreak++;
        stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak);
        break;
      case GAME_RESULTS.LOSS:
        stats.losses++;
        stats.winStreak = 0;
        break;
      case GAME_RESULTS.DRAW:
        stats.draws++;
        break;
    }
    const updatedPlayer = { ...player, stats };
    const newState = {
      ...state,
      players: {
        ...state.players,
        [username]: updatedPlayer,
      },
    };

    this.setState(newState);
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    const state = this.getState();
    const players = Object.values(state.players);

    const leaderboard = players
      .map((player) => ({
        username: player.username,
        isOnline: player.isOnline,
        gamesPlayed: player.stats?.gamesPlayed || 0,
        wins: player.stats?.wins || 0,
        losses: player.stats?.losses || 0,
        draws: player.stats?.draws || 0,
        winRate:
          (player.stats?.gamesPlayed || 0) > 0
            ? Math.round(
                ((player.stats?.wins || 0) / (player.stats?.gamesPlayed || 0)) *
                  100
              )
            : 0,
        winStreak: player.stats?.winStreak || 0,
        bestStreak: player.stats?.bestStreak || 0,
        score: this.calculateScore(player.stats || {}),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.gamesPlayed - a.gamesPlayed;
      });

    this.setState({
      ...state,
      leaderboard,
    });
  }

  calculateScore(stats) {
    const wins = stats?.wins || 0;
    const draws = stats?.draws || 0;
    const bestStreak = stats?.bestStreak || 0;

    const baseScore = wins * SCORE_POINTS.WIN + draws * SCORE_POINTS.DRAW;
    const streakBonus =
      bestStreak >= SCORE_POINTS.STREAK_BONUS_THRESHOLD
        ? bestStreak * SCORE_POINTS.STREAK_BONUS_MULTIPLIER
        : 0;
    return baseScore + streakBonus;
  }

  getOnlinePlayers() {
    const state = this.getState();
    return Object.values(state.players).filter((player) => player.isOnline);
  }

  getLeaderboard() {
    const state = this.getState();
    return state.leaderboard || [];
  }

  createChallenge(challengerUsername, challengedUsername) {
    const state = this.getState();

    const challenger = state.players[challengerUsername];
    const challenged = state.players[challengedUsername];

    if (!challenger || !challenged) {
      notification.error({
        message: NOTIFICATION_MESSAGES.CHALLENGE_ERROR,
        description: ERROR_MESSAGES.PLAYER_NOT_FOUND,
      });
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_FOUND);
    }

    if (!challenger.isOnline || !challenged.isOnline) {
      throw new Error(ERROR_MESSAGES.PLAYERS_MUST_BE_ONLINE);
    }

    const existingChallenge = Object.values(state.challenges || {}).find(
      (challenge) =>
        (challenge.challenger === challengerUsername &&
          challenge.challenged === challengedUsername) ||
        (challenge.challenger === challengedUsername &&
          challenge.challenged === challengerUsername)
    );

    if (
      existingChallenge &&
      existingChallenge.status === CHALLENGE_STATUS.PENDING
    ) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_EXISTS);
    }

    const challengeId = `${ID_PREFIXES.CHALLENGE}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const challenge = {
      id: challengeId,
      challenger: challengerUsername,
      challenged: challengedUsername,
      status: CHALLENGE_STATUS.PENDING,
      createdAt: Date.now(),
      expiresAt: Date.now() + TIME_CONSTANTS.CHALLENGE_EXPIRY,
    };

    const newState = {
      ...state,
      challenges: {
        ...state.challenges,
        [challengeId]: challenge,
      },
    };

    this.setState(newState);
    return challenge;
  }

  acceptChallenge(challengeId, username) {
    const state = this.getState();
    const challenge = state.challenges?.[challengeId];

    if (!challenge) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_NOT_FOUND);
    }

    if (challenge.challenged !== username) {
      throw new Error(ERROR_MESSAGES.ONLY_CHALLENGED_CAN_ACCEPT);
    }

    if (challenge.status !== CHALLENGE_STATUS.PENDING) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_NOT_PENDING);
    }

    if (Date.now() > challenge.expiresAt) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_EXPIRED);
    }

    const gameSessionId = this.createGameSession(
      challenge.challenger,
      challenge.challenged
    );

    const stateAfterGameSession = this.getState();
    const updatedChallenge = {
      ...challenge,
      status: CHALLENGE_STATUS.ACCEPTED,
      acceptedAt: Date.now(),
      gameSessionId,
    };

    const newState = {
      ...stateAfterGameSession,
      challenges: {
        ...stateAfterGameSession.challenges,
        [challengeId]: updatedChallenge,
      },
    };

    this.setState(newState);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.storageKey,
        newValue: JSON.stringify(newState),
        oldValue: JSON.stringify(stateAfterGameSession),
      })
    );

    return { challenge: updatedChallenge, gameSessionId };
  }

  rejectChallenge(challengeId, username) {
    const state = this.getState();
    const challenge = state.challenges?.[challengeId];

    if (!challenge) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_NOT_FOUND);
    }

    if (challenge.challenged !== username) {
      throw new Error(ERROR_MESSAGES.ONLY_CHALLENGED_CAN_REJECT);
    }

    if (challenge.status !== CHALLENGE_STATUS.PENDING) {
      throw new Error(ERROR_MESSAGES.CHALLENGE_NOT_PENDING);
    }

    const updatedChallenge = {
      ...challenge,
      status: CHALLENGE_STATUS.REJECTED,
      rejectedAt: Date.now(),
    };

    const newState = {
      ...state,
      challenges: {
        ...state.challenges,
        [challengeId]: updatedChallenge,
      },
    };

    this.setState(newState);
    return updatedChallenge;
  }

  createGameSession(player1, player2) {
    const sessionId = `${ID_PREFIXES.GAME_SESSION}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const state = this.getState();

    const gameSession = {
      id: sessionId,
      players: [player1, player2],
      status: GAME_SESSION_STATUS.ACTIVE,
      createdAt: Date.now(),
      choices: {},
      result: null,
      winner: null,
    };
    const newState = {
      ...state,
      gameSessions: {
        ...state.gameSessions,
        [sessionId]: gameSession,
      },
    };

    this.setState(newState);
    return sessionId;
  }

  getPendingChallenges(username) {
    const state = this.getState();
    const challenges = Object.values(state.challenges || {});

    return challenges.filter(
      (challenge) =>
        challenge.challenged === username &&
        challenge.status === CHALLENGE_STATUS.PENDING &&
        Date.now() < challenge.expiresAt
    );
  }

  getActiveGameSession(username) {
    const state = this.getState();
    const sessions = Object.values(state.gameSessions || {});
    return sessions.find(
      (session) =>
        session.players.includes(username) &&
        session.status === GAME_SESSION_STATUS.ACTIVE
    );
  }

  cleanupExpiredChallenges() {
    const state = this.getState();
    const challenges = state.challenges || {};
    const now = Date.now();
    const activeChallenges = Object.fromEntries(
      Object.entries(challenges).filter(
        ([, challenge]) =>
          challenge.status !== CHALLENGE_STATUS.PENDING ||
          now < challenge.expiresAt
      )
    );

    this.setState({
      ...state,
      challenges: activeChallenges,
    });
  }

  makePlayerChoice(sessionId, username, choice) {
    const state = this.getState();
    const session = state.gameSessions?.[sessionId];
    if (!session) {
      throw new Error(ERROR_MESSAGES.GAME_SESSION_NOT_FOUND);
    }

    if (!session.players.includes(username)) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_IN_GAME);
    }

    if (session.status !== GAME_SESSION_STATUS.ACTIVE) {
      throw new Error(ERROR_MESSAGES.GAME_NOT_ACTIVE);
    }

    if (session.choices[username]) {
      throw new Error(ERROR_MESSAGES.CHOICE_ALREADY_MADE);
    }
    const updatedSession = {
      ...session,
      choices: {
        ...session.choices,
        [username]: choice,
      },
    };

    const playerChoices = Object.keys(updatedSession.choices);
    if (playerChoices.length === 2) {
      const [player1, player2] = session.players;
      const choice1 = updatedSession.choices[player1];
      const choice2 = updatedSession.choices[player2];

      const gameResult = this.determineWinner(choice1, choice2);
      let winner = null;

      if (gameResult === GAME_RESULTS.WIN) {
        winner = player1;
      } else if (gameResult === GAME_RESULTS.LOSE) {
        winner = player2;
      }
      updatedSession.status = GAME_SESSION_STATUS.COMPLETED;
      updatedSession.result = {
        [player1]: gameResult,
        [player2]:
          gameResult === GAME_RESULTS.WIN
            ? GAME_RESULTS.LOSE
            : gameResult === GAME_RESULTS.LOSE
            ? GAME_RESULTS.WIN
            : GAME_RESULTS.DRAW,
      };
      updatedSession.winner = winner;
      updatedSession.completedAt = Date.now();
      if (winner === player1) {
        this.updatePlayerStats(player1, GAME_RESULTS.WIN);
        this.updatePlayerStats(player2, GAME_RESULTS.LOSS);
      } else if (winner === player2) {
        this.updatePlayerStats(player1, GAME_RESULTS.LOSS);
        this.updatePlayerStats(player2, GAME_RESULTS.WIN);
      } else {
        this.updatePlayerStats(player1, GAME_RESULTS.DRAW);
        this.updatePlayerStats(player2, GAME_RESULTS.DRAW);
      }
    }

    const newState = {
      ...state,
      gameSessions: {
        ...state.gameSessions,
        [sessionId]: updatedSession,
      },
    };

    this.setState(newState);
    return updatedSession;
  }

  determineWinner(choice1, choice2) {
    if (choice1 === choice2) return GAME_RESULTS.DRAW;

    return WIN_CONDITIONS[choice1] === choice2
      ? GAME_RESULTS.WIN
      : GAME_RESULTS.LOSE;
  }

  cleanupCompletedGames() {
    const state = this.getState();
    const sessions = state.gameSessions || {};
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour

    const activeSessions = Object.fromEntries(
      Object.entries(sessions).filter(
        ([, session]) =>
          session.status === GAME_SESSION_STATUS.ACTIVE ||
          (session.status === GAME_SESSION_STATUS.COMPLETED &&
            session.completedAt &&
            session.completedAt > oneHourAgo)
      )
    );

    this.setState({
      ...state,
      gameSessions: activeSessions,
    });
  }

  isPlayerInActiveGame(username) {
    const activeSession = this.getActiveGameSession(username);
    return !!activeSession;
  }

  getWaitingQueue() {
    return [];
  }

  isValidChoice(choice) {
    return Object.values(GAME_CHOICES).includes(choice);
  }

  getGameStats() {
    const state = this.getState();
    const players = Object.values(state.players);

    return {
      totalPlayers: players.length,
      onlinePlayers: players.filter((p) => p.isOnline).length,
      totalGames: players.reduce(
        (sum, p) => sum + (p.stats?.gamesPlayed || 0),
        0
      ),
      activeChallenges: Object.values(state.challenges || {}).filter(
        (c) => c.status === CHALLENGE_STATUS.PENDING
      ).length,
      activeGames: Object.values(state.gameSessions || {}).filter(
        (s) => s.status === GAME_SESSION_STATUS.ACTIVE
      ).length,
    };
  }
}

export const gameState = new GameStateManager();
