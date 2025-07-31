class CrossTabSyncManager {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'rps_game_state') {
        this.notifyListeners(e.newValue ? JSON.parse(e.newValue) : null);
      }
    });
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
}

export const crossTabSync = new CrossTabSyncManager();
