const gameStateKey = "gameState";

export const saveGameStateToLocalStorage = (gameState, difficulty) => {
  localStorage.setItem(gameStateKey + '_' + difficulty, JSON.stringify(gameState));
};

export const loadGameStateFromLocalStorage = (difficulty) => {
  const state = localStorage.getItem(gameStateKey + '_' + difficulty);
  return state ? JSON.parse(state) : null;
};

const gameStatKey = "gameStats";

export const saveStatsToLocalStorage = (gameStats, difficulty) => {
  localStorage.setItem(gameStatKey + '_' + difficulty, JSON.stringify(gameStats));
};

export const loadStatsFromLocalStorage = (difficulty) => {
  const stats = localStorage.getItem(gameStatKey + '_' + difficulty);
  return stats ? JSON.parse(stats) : null;
};
