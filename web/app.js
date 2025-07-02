import { ChessEngine } from '../engine/index.js';
import { LoggerPlugin } from '../engine/plugins.js';

const boardEl = document.getElementById('board');
const engine = new ChessEngine();
engine.addPlugin(new LoggerPlugin());

const pieceSymbols = {
  pawn:   { white: '♙', black: '♟' },
  rook:   { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen:  { white: '♕', black: '♛' },
  king:   { white: '♔', black: '♚' }
};

let selected = null;

function render() {
  boardEl.innerHTML = '';
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((x + y) % 2 ? 'dark' : 'light');
      square.dataset.x = x;
      square.dataset.y = y;
      const piece = engine.getPiece(x, y);
      if (piece) {
        square.textContent = pieceSymbols[piece.type][piece.color];
      }
      square.addEventListener('click', onSquareClick);
      boardEl.appendChild(square);
    }
  }
}

function onSquareClick(e) {
  const x = parseInt(e.currentTarget.dataset.x, 10);
  const y = parseInt(e.currentTarget.dataset.y, 10);
  if (selected) {
    if (engine.move(selected.x, selected.y, x, y)) {
      selected = null;
      render();
      return;
    }
    selected = null;
  } else {
    const piece = engine.getPiece(x, y);
    if (piece && piece.color === engine.turn) {
      selected = { x, y };
    }
  }
}

render();
