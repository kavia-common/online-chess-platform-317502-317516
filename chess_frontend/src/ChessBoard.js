import React, { useMemo, useState } from 'react';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * Map piece symbol to a unicode glyph.
 * Using unicode avoids adding heavy UI dependencies.
 */
function pieceGlyph(sym) {
  const map = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
  };
  return map[sym] || '';
}

function squareNameFromRowCol(row, col) {
  // row 0 is rank 8, row 7 is rank 1
  const rank = 8 - row;
  const file = files[col];
  return `${file}${rank}`;
}

// PUBLIC_INTERFACE
export default function ChessBoard({ pieces, turn, onSubmitMove, disabled }) {
  /**
   * Props:
   * - pieces: 8x8 matrix (rank 8->1, file a->h) with 'P','p',... or null
   * - turn: 'white'|'black' (for UI only; backend validates moves)
   * - onSubmitMove(fromSq, toSq, promotion?) -> Promise / void
   * - disabled: disable interactions
   */
  const [selected, setSelected] = useState(null);

  const selectableColor = useMemo(() => (turn === 'white' ? 'white' : 'black'), [turn]);

  function isOwnPiece(sym) {
    if (!sym) return false;
    const isWhite = sym === sym.toUpperCase();
    return selectableColor === 'white' ? isWhite : !isWhite;
  }

  function handleSquareClick(row, col) {
    if (disabled) return;
    const sq = squareNameFromRowCol(row, col);
    const sym = pieces?.[row]?.[col] ?? null;

    if (!selected) {
      if (sym && isOwnPiece(sym)) setSelected(sq);
      return;
    }

    if (selected === sq) {
      setSelected(null);
      return;
    }

    // If user clicked another own piece, switch selection.
    if (sym && isOwnPiece(sym)) {
      setSelected(sq);
      return;
    }

    // Otherwise attempt move.
    onSubmitMove(selected, sq);
    setSelected(null);
  }

  return (
    <div className="board" role="grid" aria-label="Chessboard">
      {Array.from({ length: 8 }).map((_, row) => (
        <div className="board-row" role="row" key={`r-${row}`}>
          {Array.from({ length: 8 }).map((_, col) => {
            const sym = pieces?.[row]?.[col] ?? null;
            const isLight = (row + col) % 2 === 0;
            const sq = squareNameFromRowCol(row, col);
            const isSelected = selected === sq;

            return (
              <button
                key={`c-${row}-${col}`}
                type="button"
                className={[
                  'square',
                  isLight ? 'square-light' : 'square-dark',
                  isSelected ? 'square-selected' : ''
                ].join(' ')}
                onClick={() => handleSquareClick(row, col)}
                aria-label={`${sq}${sym ? ` ${sym}` : ''}`}
              >
                <span className="piece" aria-hidden="true">{pieceGlyph(sym)}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
