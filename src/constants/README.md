# 🎯 Constants Documentation

This directory contains all the centralized constants used throughout the Rock Paper Scissors application.

## 📦 Available Constants

### Game Results
```javascript
import { GAME_RESULTS } from '../constants';

GAME_RESULTS.WIN      // 'win'
GAME_RESULTS.LOSS     // 'loss' 
GAME_RESULTS.LOSE     // 'lose' (alternative naming)
GAME_RESULTS.DRAW     // 'draw'
```

### Challenge Status
```javascript
import { CHALLENGE_STATUS } from '../constants';

CHALLENGE_STATUS.PENDING   // 'pending'
CHALLENGE_STATUS.ACCEPTED  // 'accepted'
CHALLENGE_STATUS.REJECTED  // 'rejected'
CHALLENGE_STATUS.EXPIRED   // 'expired'
```

### Game Session Status
```javascript
import { GAME_SESSION_STATUS } from '../constants';

GAME_SESSION_STATUS.ACTIVE     // 'active'
GAME_SESSION_STATUS.COMPLETED  // 'completed'
GAME_SESSION_STATUS.CANCELLED  // 'cancelled'
```

### Game Choices
```javascript
import { GAME_CHOICES, WIN_CONDITIONS } from '../constants';

GAME_CHOICES.ROCK      // 'rock'
GAME_CHOICES.PAPER     // 'paper'
GAME_CHOICES.SCISSORS  // 'scissors'

// Win conditions (what each choice beats)
WIN_CONDITIONS[GAME_CHOICES.ROCK]      // 'scissors'
WIN_CONDITIONS[GAME_CHOICES.PAPER]     // 'rock'
WIN_CONDITIONS[GAME_CHOICES.SCISSORS]  // 'paper'
```

### Time Constants
```javascript
import { TIME_CONSTANTS } from '../constants';

TIME_CONSTANTS.CHALLENGE_EXPIRY              // 120000 (2 minutes)
TIME_CONSTANTS.GAME_SESSION_CHECK_INTERVAL   // 3000 (3 seconds)
TIME_CONSTANTS.DATA_REFRESH_INTERVAL         // 5000 (5 seconds)
TIME_CONSTANTS.CLEANUP_INTERVAL              // 10000 (10 seconds)
```

### Score Calculation
```javascript
import { SCORE_POINTS } from '../constants';

SCORE_POINTS.WIN                        // 3 points
SCORE_POINTS.DRAW                       // 1 point
SCORE_POINTS.LOSS                       // 0 points
SCORE_POINTS.STREAK_BONUS_THRESHOLD     // 3 (minimum wins for bonus)
SCORE_POINTS.STREAK_BONUS_MULTIPLIER    // 2 (bonus multiplier)
```

### Error Messages
```javascript
import { ERROR_MESSAGES } from '../constants';

ERROR_MESSAGES.USERNAME_TAKEN
ERROR_MESSAGES.PLAYER_NOT_FOUND
ERROR_MESSAGES.PLAYERS_MUST_BE_ONLINE
ERROR_MESSAGES.CHALLENGE_EXISTS
ERROR_MESSAGES.CHALLENGE_NOT_FOUND
ERROR_MESSAGES.CHALLENGE_EXPIRED
// ... and more
```

### Storage Keys
```javascript
import { STORAGE_KEYS } from '../constants';

STORAGE_KEYS.GAME_STATE  // 'rps_game_state'
```

### ID Prefixes
```javascript
import { ID_PREFIXES } from '../constants';

ID_PREFIXES.CHALLENGE      // 'challenge'
ID_PREFIXES.GAME_SESSION   // 'game'
```

### Default State
```javascript
import { DEFAULT_STATE, INITIAL_PLAYER_STATS } from '../constants';

DEFAULT_STATE           // Default game state structure
INITIAL_PLAYER_STATS    // Default player statistics
```

## 🚀 Usage Examples

### GameState Implementation
```javascript
import { 
  GAME_RESULTS, 
  CHALLENGE_STATUS, 
  ERROR_MESSAGES,
  TIME_CONSTANTS 
} from '../constants';

// Using game results
if (gameResult === GAME_RESULTS.WIN) {
  this.updatePlayerStats(player, GAME_RESULTS.WIN);
}

// Using challenge status
if (challenge.status !== CHALLENGE_STATUS.PENDING) {
  throw new Error(ERROR_MESSAGES.CHALLENGE_NOT_PENDING);
}

// Using time constants
setTimeout(() => {
  this.cleanupExpiredChallenges();
}, TIME_CONSTANTS.CLEANUP_INTERVAL);
```

### Component Implementation
```javascript
import { TIME_CONSTANTS, GAME_CHOICES } from '../constants';

// In useEffect
useEffect(() => {
  const interval = setInterval(() => {
    loadGameData();
  }, TIME_CONSTANTS.DATA_REFRESH_INTERVAL);
  
  return () => clearInterval(interval);
}, []);

// In game component
const choices = [
  { id: GAME_CHOICES.ROCK, emoji: '🪨', name: 'Rock' },
  { id: GAME_CHOICES.PAPER, emoji: '📄', name: 'Paper' },
  { id: GAME_CHOICES.SCISSORS, emoji: '✂️', name: 'Scissors' }
];
```

## 🎯 Benefits

1. **Type Safety** - No more typos in string literals
2. **Maintainability** - Change values in one place
3. **Consistency** - Same values used across the app
4. **Documentation** - Clear understanding of all possible values
5. **Refactoring** - Easy to find and update related code
6. **Testing** - Reliable constants for test cases

## 📋 Best Practices

1. **Always import from constants** instead of using string literals
2. **Use specific imports** to avoid namespace pollution:
   ```javascript
   // Good
   import { GAME_RESULTS, CHALLENGE_STATUS } from '../constants';
   
   // Avoid
   import * as constants from '../constants';
   ```
3. **Add new constants** when introducing new magic strings/numbers
4. **Group related constants** in objects for better organization
5. **Use descriptive names** that clearly indicate the purpose

## 🔄 Migration Guide

### Before (using magic strings)
```javascript
if (challenge.status === 'pending') {
  setTimeout(() => {
    // cleanup
  }, 2 * 60 * 1000);
}
```

### After (using constants)
```javascript
import { CHALLENGE_STATUS, TIME_CONSTANTS } from '../constants';

if (challenge.status === CHALLENGE_STATUS.PENDING) {
  setTimeout(() => {
    // cleanup
  }, TIME_CONSTANTS.CHALLENGE_EXPIRY);
}
```

Happy coding! 🎮