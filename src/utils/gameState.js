class GameStateManager {
  constructor() {
    this.storageKey = 'rps_game_state';
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    this.state = saved ? JSON.parse(saved) : {
      players: {},
      games: {},
      leaderboard: []
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.storageKey,
      newValue: JSON.stringify(this.state)
    }));
  }

  addPlayer(username, tabId) {
    if (this.state.players[username]) {
      throw new Error('Username already exists');
    }
    
    this.state.players[username] = {
      username,
      tabId,
      status: 'online',
      score: 0,
      gamesPlayed: 0,
      joinedAt: Date.now()
    };
    
    this.saveState();
    return this.state.players[username];
  }

  removePlayer(username) {
    if (this.state.players[username]) {
      delete this.state.players[username];
      this.saveState();
    }
  }

  getState() {
    return { ...this.state };
  }

  getPlayer(username) {
    return this.state.players[username] || null;
  }
}

export const gameState = new GameStateManager(); 