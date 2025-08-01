import { gameState } from './gameState.js';

class CrossTabSyncManager {
  constructor() {
    this.listeners = new Set();
    this.currentTabId = this.generateTabId();
    this.init();
  }

  init() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'rps_game_state') {
        this.notifyListeners(e.newValue ? JSON.parse(e.newValue) : null);
      }
    });
    window.addEventListener('beforeunload', () => {
      this.handleTabClosure();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.handleTabClosure();
      }
    });
  }

  handleTabClosure() {
    try {
      const currentState = gameState.getState();
      if (currentState.players) {
        for (const [username, player] of Object.entries(currentState.players)) {
          if (player.tabId === this.currentTabId) {
            gameState.removePlayer(username);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error handling tab closure:', error); 
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(newState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Cross-tab sync error:', error);
      }
    });
  }
  

  generateTabId() {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentTabId() {
    return this.currentTabId;
  }
}

export const crossTabSync = new CrossTabSyncManager();
