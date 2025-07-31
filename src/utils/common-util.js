  export const formatJoinTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just joined';
  };



   export const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  export const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return 'first';
      case 2:
        return 'second';
      case 3:
        return 'third';
      default:
        return '';
    }
  };

  export const getWinColor = (wins) => {
    if (wins >= 10) return 'var(--success-color)';
    if (wins >= 5) return 'var(--warning-color)';
    if (wins >= 1) return 'var(--primary-color)';
    return 'var(--text-secondary)';
  };

