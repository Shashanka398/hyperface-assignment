export const GAME_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  LOSE: 'lose', 
  DRAW: 'draw'
};

export const CHALLENGE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const GAME_SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const GAME_CHOICES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};

export const WIN_CONDITIONS = {
  [GAME_CHOICES.ROCK]: GAME_CHOICES.SCISSORS,
  [GAME_CHOICES.PAPER]: GAME_CHOICES.ROCK,
  [GAME_CHOICES.SCISSORS]: GAME_CHOICES.PAPER
};

export const STORAGE_KEYS = {
  GAME_STATE: 'rps_game_state',
  THEME_KEY:'theme'
};


export const TIME_CONSTANTS = {
  CHALLENGE_EXPIRY: 2 * 60 * 1000, 
  GAME_SESSION_CHECK_INTERVAL: 3000,
  DATA_REFRESH_INTERVAL: 5000,
  CLEANUP_INTERVAL: 10000
};



export const ERROR_MESSAGES = {
  USERNAME_TAKEN: 'Username already taken',
  PLAYER_NOT_FOUND: 'One or both players not found',
  PLAYERS_MUST_BE_ONLINE: 'Both players must be online',
  CHALLENGE_EXISTS: 'Challenge already exists between these players',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  ONLY_CHALLENGED_CAN_ACCEPT: 'Only the challenged player can accept',
  ONLY_CHALLENGED_CAN_REJECT: 'Only the challenged player can reject',
  CHALLENGE_NOT_PENDING: 'Challenge is no longer pending',
  CHALLENGE_EXPIRED: 'Challenge has expired',
  GAME_SESSION_NOT_FOUND: 'Game session not found',
  PLAYER_NOT_IN_GAME: 'Player not in this game session',
  GAME_NOT_ACTIVE: 'Game session is not active',
  FAILED_TO_LOAD:'Failed to load game session',
  CHOICE_ALREADY_MADE: 'Player has already made a choice',
  FAILED_TO_CHOICE:'Failed to make choice:',
  GAME_EXPIRED:'The game session your`e looking for doesn`t exist or has expired.',
}

export const NOTIFICATION_MESSAGES = {
  CHALLENGE_ERROR: 'Challenge Error',
  CHALLENGE_SENT: 'Challenge sent successfully',
  CHALLENGE_ACCEPTED: 'Challenge accepted',
  CHALLENGE_REJECTED: 'Challenge rejected',
  GAME_STARTED: 'Entering game arena....',
  GAME_COMPLETED: 'Game completed',
  GAME_CHOICE_DONE:'Choice made! Waiting for opponent...',
  YOU_WIN: 'You Win!',
  YOU_LOSE: 'You Lose!',
  ITS_A_DRAW: 'It\'s a Draw!',
  WAITING_FOR_PLAYER: 'Waiting for {player} to finish their game',
  PLAYER_WAITING_FOR_YOU: '{player} is waiting for you',
  YOURE_WAITING_FOR: 'You\'re Waiting For',
  PLAYERS_WAITING_FOR_YOU: 'Players Waiting for You',
};

export const INITIAL_PLAYER_STATS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  bestStreak: 0
};

export const ID_PREFIXES = {
  CHALLENGE: 'challenge',
  GAME_SESSION: 'game'
};

export const DEFAULT_STATE = {
  players: {},
  leaderboard: [],
  challenges: {},
  gameSessions: {},
  lastUpdated: null
};


  export const CHOICES = [
    { id: 'rock', emoji: '🪨', name: 'Rock' },
    { id: 'paper', emoji: '📄', name: 'Paper' },
    { id: 'scissors', emoji: '✂️', name: 'Scissors' }
  ];
