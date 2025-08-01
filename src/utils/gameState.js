import {
  GAME_RESULTS,
  CHALLENGE_STATUS,
  GAME_SESSION_STATUS,
  GAME_CHOICES,
  WIN_CONDITIONS,
  STORAGE_KEYS,
  TIME_CONSTANTS,
  ERROR_MESSAGES,
  INITIAL_PLAYER_STATS,
  ID_PREFIXES
} from '../constants/common.constants.js';

class GameStateManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.GAME_STATE;
    this.init();
  }

  init() {
    const existing = this.getState();
    if (!existing.players) {
      this.setState({
        players: {},
        leaderboard: [],
        challenges: {},
        gameSessions: {},
        waitingQueue: [],
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
        if (!parsedState.waitingQueue) {
          parsedState.waitingQueue = [];
        }
        return parsedState;
      }
      return {
        players: {},
        leaderboard: [],
        challenges: {},
        gameSessions: {},
        waitingQueue: [],
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error("Error getting game state:", error);
      return {
        players: {},
        leaderboard: [],
        challenges: {},
        gameSessions: {},
        waitingQueue: [],
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
        ...INITIAL_PLAYER_STATS
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

    // Also remove player from waiting queue
    this.removeFromWaitingQueue(username);

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
        break;
      case GAME_RESULTS.LOSS:
        stats.losses++;
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
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.gamesPlayed - a.gamesPlayed;
      });

    this.setState({
      ...state,
      leaderboard,
    });
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
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_FOUND);
    }

    if (!challenger.isOnline || !challenged.isOnline) {
      throw new Error(ERROR_MESSAGES.PLAYERS_MUST_BE_ONLINE);
    }

    const challengerActiveGame = this.getActiveGameSession(challengerUsername);
    const challengedActiveGame = this.getActiveGameSession(challengedUsername);

    if (challengerActiveGame) {
      throw new Error("You are already in a game");
    }

    if (challengedActiveGame) {
      this.addToWaitingQueue(challengerUsername, challengedUsername);
      throw new Error(`${challengedUsername} is currently in a game. You've been added to the waiting list.`);
    }

    const existingChallenge = Object.values(state.challenges || {}).find(
      (challenge) =>
        (challenge.challenger === challengerUsername &&
          challenge.challenged === challengedUsername) ||
        (challenge.challenger === challengedUsername &&
          challenge.challenged === challengerUsername)
    );

    if (existingChallenge && existingChallenge.status === CHALLENGE_STATUS.PENDING) {
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

    const activeSession = sessions.find(
      (session) =>
        session.players.includes(username) && session.status === GAME_SESSION_STATUS.ACTIVE
    );

    return activeSession;
  }

  cleanupExpiredChallenges() {
    const state = this.getState();
    const challenges = state.challenges || {};
    const now = Date.now();

    const activeChallenges = Object.fromEntries(
      Object.entries(challenges).filter(
        ([, challenge]) =>
          challenge.status !== CHALLENGE_STATUS.PENDING || now < challenge.expiresAt
      )
    );

    this.setState({
      ...state,
      challenges: activeChallenges,
    });
  }

  // Waiting Queue Management
  addToWaitingQueue(waitingPlayer, targetPlayer) {
    const state = this.getState();
    const waitingQueue = state.waitingQueue || [];
    
    // Check if this waiting request already exists
    const existingRequest = waitingQueue.find(
      (request) => 
        request.waitingPlayer === waitingPlayer && 
        request.targetPlayer === targetPlayer
    );
    
    if (existingRequest) {
      return; // Already in queue for this player
    }
    
    const queueEntry = {
      id: `wait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      waitingPlayer,
      targetPlayer,
      createdAt: Date.now(),
    };
    
    const newState = {
      ...state,
      waitingQueue: [...waitingQueue, queueEntry],
    };
    
    this.setState(newState);
    console.log(`Added ${waitingPlayer} to waiting queue for ${targetPlayer}`);
  }

  removeFromWaitingQueue(waitingPlayer, targetPlayer = null) {
    const state = this.getState();
    const waitingQueue = state.waitingQueue || [];
    
    const filteredQueue = waitingQueue.filter((request) => {
      if (targetPlayer) {
        // Remove specific waiting request
        return !(request.waitingPlayer === waitingPlayer && request.targetPlayer === targetPlayer);
      } else {
        // Remove all waiting requests for this player
        return request.waitingPlayer !== waitingPlayer;
      }
    });
    
    const newState = {
      ...state,
      waitingQueue: filteredQueue,
    };
    
    this.setState(newState);
  }

  getWaitingQueue() {
    const state = this.getState();
    return state.waitingQueue || [];
  }

  getPlayersWaitingFor(username) {
    const waitingQueue = this.getWaitingQueue();
    return waitingQueue.filter(request => request.targetPlayer === username);
  }

  processWaitingQueue(availablePlayer) {
    const state = this.getState();
    const waitingQueue = state.waitingQueue || [];
    
    const waitingPlayers = waitingQueue.filter(
      (request) => request.targetPlayer === availablePlayer
    );
    
    if (waitingPlayers.length === 0) {
      return null;
    }    
    const nextWaiter = waitingPlayers[0];
    
    const waiterPlayer = state.players[nextWaiter.waitingPlayer];
    if (!waiterPlayer || !waiterPlayer.isOnline || this.getActiveGameSession(nextWaiter.waitingPlayer)) {
      this.removeFromWaitingQueue(nextWaiter.waitingPlayer, availablePlayer);
      return this.processWaitingQueue(availablePlayer); 
    }
    
    this.removeFromWaitingQueue(nextWaiter.waitingPlayer, availablePlayer);
    
    try {
      const challenge = this.createChallenge(nextWaiter.waitingPlayer, availablePlayer);
      console.log(`Automatic challenge created: ${nextWaiter.waitingPlayer} vs ${availablePlayer}`);
      return {
        challenger: nextWaiter.waitingPlayer,
        challenged: availablePlayer,
        challenge
      };
    } catch (error) {
      console.error('Failed to create automatic challenge:', error);
      return null;
    }
  }

  cleanupCompletedGames() {
    const state = this.getState();
    const gameSessions = state.gameSessions || {};
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    const activeGames = Object.fromEntries(
      Object.entries(gameSessions).filter(([, session]) => {
        if (session.status === GAME_SESSION_STATUS.ACTIVE) {
          return true; 
        }        
        if (session.status === GAME_SESSION_STATUS.COMPLETED && session.completedAt) {
          return (now - session.completedAt) < ONE_HOUR;
        }
        
        return false; 
      })
    );
    
    if (Object.keys(activeGames).length !== Object.keys(gameSessions).length) {
      const newState = {
        ...state,
        gameSessions: activeGames,
      };
      
      this.setState(newState);
      console.log(`Cleaned up ${Object.keys(gameSessions).length - Object.keys(activeGames).length} old game sessions`);
    }
  }

  forceStatusUpdate() {
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.storageKey,
      newValue: JSON.stringify(this.getState()),
      oldValue: null
    }));
  }

  getPlayerStatus(username) {
    this.cleanupCompletedGames();    
    const activeGame = this.getActiveGameSession(username);
    const waitingFor = this.getWaitingQueue().filter(q => q.waitingPlayer === username);
    const waitersForPlayer = this.getWaitingQueue().filter(q => q.targetPlayer === username);
    
    const status = {
      isInGame: !!activeGame,
      activeGameId: activeGame?.id || null,
      waitingFor: waitingFor.map(w => w.targetPlayer),
      hasWaiters: waitersForPlayer.length > 0,
      waitersCount: waitersForPlayer.length
    };

    return status;
  }

  isPlayerInActiveGame(username) {
    const state = this.getState();
    const sessions = Object.values(state.gameSessions || {});
    
    const inGame = sessions.some(
      (session) =>
        session.players.includes(username) && 
        session.status === GAME_SESSION_STATUS.ACTIVE
    );

    return inGame;
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
    let winner = null;
    let gameCompleted = false;

    if (playerChoices.length === 2) {
      const [player1, player2] = session.players;
      const choice1 = updatedSession.choices[player1];
      const choice2 = updatedSession.choices[player2];

      const gameResult = this.determineWinner(choice1, choice2);
      gameCompleted = true;

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
    }

    const newState = {
      ...state,
      gameSessions: {
        ...state.gameSessions,
        [sessionId]: updatedSession,
      },
    };

    this.setState(newState);

          if (gameCompleted) {
        const [player1, player2] = session.players;
        console.log(
          `Game completed! Winner: ${
            winner || "draw"
          }, Player1: ${player1}, Player2: ${player2}`
        );

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

        this.cleanupCompletedGames();

        window.dispatchEvent(new StorageEvent('storage', {
          key: this.storageKey,
          newValue: JSON.stringify(this.getState()),
          oldValue: null
        }));

        setTimeout(() => {
          const match1 = this.processWaitingQueue(player1);
          const match2 = this.processWaitingQueue(player2);
          
          if (match1) {
            window.dispatchEvent(new StorageEvent('storage', {
              key: this.storageKey,
              newValue: JSON.stringify(this.getState()),
              oldValue: null
            }));
          }
          if (match2) {
            window.dispatchEvent(new StorageEvent('storage', {
              key: this.storageKey,
              newValue: JSON.stringify(this.getState()),
              oldValue: null
            }));
          }
        }, 500); 
      }

    return updatedSession;
  }

  determineWinner(choice1, choice2) {
    if (choice1 === choice2) return GAME_RESULTS.DRAW;
    return WIN_CONDITIONS[choice1] === choice2 ? GAME_RESULTS.WIN : GAME_RESULTS.LOSE;
  }
}

export const gameState = new GameStateManager();
