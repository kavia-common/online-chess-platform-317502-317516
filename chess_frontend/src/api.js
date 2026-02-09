/**
 * Minimal API client for the chess backend.
 *
 * The backend is expected to be reachable at REACT_APP_CHESS_BACKEND_URL.
 * In the Kavia environment, the backend runs on a different port (e.g. 3001).
 */

const DEFAULT_BASE_URL = 'http://localhost:3001';

function getBaseUrl() {
  return (process.env.REACT_APP_CHESS_BACKEND_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

// PUBLIC_INTERFACE
export async function createGame() {
  /** Create a new game. Returns {game_id, created_at_ms}. */
  const res = await fetch(`${getBaseUrl()}/games`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to create game (${res.status})`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function getGameState(gameId) {
  /** Get current game state. */
  const res = await fetch(`${getBaseUrl()}/games/${encodeURIComponent(gameId)}`);
  if (!res.ok) throw new Error(`Failed to load game (${res.status})`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function submitMove(gameId, uci) {
  /** Submit a move in UCI format. Returns {ok, error, state}. */
  const res = await fetch(`${getBaseUrl()}/games/${encodeURIComponent(gameId)}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uci })
  });
  if (!res.ok) throw new Error(`Failed to submit move (${res.status})`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function restartGame(gameId) {
  /** Restart a game. Returns {ok, error, state}. */
  const res = await fetch(`${getBaseUrl()}/games/${encodeURIComponent(gameId)}/restart`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to restart game (${res.status})`);
  return res.json();
}
