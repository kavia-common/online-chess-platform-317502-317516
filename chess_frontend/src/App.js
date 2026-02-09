import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import ChessBoard from './ChessBoard';
import { createGame, getGameState, restartGame, submitMove } from './api';

function uciFromSquares(fromSq, toSq) {
  // Promotions not handled in UI yet; backend accepts promotion suffix.
  return `${fromSq}${toSq}`;
}

function formatMove(uci, index) {
  // Basic display: "1. e2e4"
  const moveNo = Math.floor(index / 2) + 1;
  const prefix = index % 2 === 0 ? `${moveNo}.` : `${moveNo}...`;
  return `${prefix} ${uci}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Main chess application shell. */
  const [theme, setTheme] = useState('light');
  const [gameId, setGameId] = useState(null);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const statusLabel = useMemo(() => {
    if (!state) return 'Loading…';
    if (state.status === 'checkmate') return `Checkmate — ${state.winner} wins`;
    if (state.status === 'stalemate') return 'Stalemate — draw';
    if (state.status.startsWith('draw_')) return `Draw — ${state.status.replace('draw_', '').replaceAll('_', ' ')}`;
    if (state.status === 'check') return `${state.turn} to move — check`;
    return `${state.turn} to move`;
  }, [state]);

  async function bootstrapGame() {
    setBusy(true);
    setError('');
    try {
      const created = await createGame();
      setGameId(created.game_id);
      const gs = await getGameState(created.game_id);
      setState(gs);
    } catch (e) {
      setError(e?.message || 'Failed to start game.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    bootstrapGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle light/dark theme. */
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  async function handleSubmitMove(fromSq, toSq) {
    if (!gameId || !state) return;
    if (state.status === 'checkmate' || state.status === 'stalemate' || state.status.startsWith('draw_')) return;

    const uci = uciFromSquares(fromSq, toSq);

    setBusy(true);
    setError('');
    try {
      const res = await submitMove(gameId, uci);
      if (!res.ok) {
        setError(res.error || 'Illegal move.');
        return;
      }
      setState(res.state);
    } catch (e) {
      setError(e?.message || 'Failed to submit move.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRestart() {
    if (!gameId) return;
    setBusy(true);
    setError('');
    try {
      const res = await restartGame(gameId);
      if (!res.ok) {
        setError(res.error || 'Failed to restart.');
        return;
      }
      setState(res.state);
    } catch (e) {
      setError(e?.message || 'Failed to restart.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="App">
      <div className="page">
        <nav className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">♟</div>
            <div className="brand-text">
              <div className="brand-title">Online Chess</div>
              <div className="brand-subtitle">Two-player (local) with legal move enforcement</div>
            </div>
          </div>

          <button
            className="btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            type="button"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </nav>

        <main className="layout">
          <section className="board-panel">
            <div className="turn-indicator" role="status" aria-live="polite">
              {statusLabel}
            </div>

            <ChessBoard
              pieces={state?.pieces}
              turn={state?.turn || 'white'}
              onSubmitMove={handleSubmitMove}
              disabled={busy || !state}
            />

            <div className="actions">
              <button className="btn btn-primary" onClick={handleRestart} type="button" disabled={!gameId || busy}>
                Restart game
              </button>

              <button className="btn" onClick={bootstrapGame} type="button" disabled={busy}>
                New game
              </button>
            </div>

            {error ? <div className="error" role="alert">{error}</div> : null}
          </section>

          <aside className="sidebar" aria-label="Move history">
            <div className="sidebar-header">
              <div className="sidebar-title">Move history</div>
              <div className="sidebar-meta">{gameId ? `Game: ${gameId}` : '—'}</div>
            </div>

            <ol className="moves">
              {(state?.move_history_uci || []).map((m, idx) => (
                <li key={`${idx}-${m}`} className="move">{formatMove(m, idx)}</li>
              ))}
              {state?.move_history_uci?.length ? null : (
                <li className="move move-empty">No moves yet. Select a piece, then select a destination square.</li>
              )}
            </ol>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
