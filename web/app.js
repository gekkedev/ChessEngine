import { ChessEngine } from '../engine/index.js';
import { LoggerPlugin } from '../engine/plugins.js';
import { LOCALES } from '../engine/locales.js';

const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const infoEl = document.getElementById('info');
const statusEl = document.getElementById('status');
const capWhiteEl = document.getElementById('captured-white');
const capBlackEl = document.getElementById('captured-black');
const capWhiteLabelEl = document.getElementById('captured-white-label');
const capBlackLabelEl = document.getElementById('captured-black-label');
const resetBtn = document.getElementById('reset');

const engine = new ChessEngine();
engine.addPlugin(new LoggerPlugin());
const lang = (navigator.language || 'en').split('-')[0];
if (LOCALES[lang]) engine.setLanguage(lang);
capWhiteLabelEl.textContent = engine.getCapturedByWhiteLabel();
capBlackLabelEl.textContent = engine.getCapturedByBlackLabel();
resetBtn.textContent = engine.getResetLabel();

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
  turnEl.textContent = engine.getTurnLabel() + ': ' + engine.getColorName(engine.turn);
  const event = engine.getLastEvent();
  statusEl.textContent = event ? engine.getEventName(event) : '';
  updateCaptured();
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
      if (selected && selected.x === x && selected.y === y) {
        square.classList.add('selected');
      }
      square.addEventListener('click', onSquareClick);
      square.addEventListener('mouseover', () => {
        const p = engine.getPiece(x, y);
        const coord = String.fromCharCode(97 + x).toLocaleUpperCase() + (y + 1);
        infoEl.textContent = p ? engine.getPieceName(p.type) + ' ' + coord : coord;
      });
      square.addEventListener('mouseout', () => {
        infoEl.textContent = '';
      });
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
    render();
  } else {
    const piece = engine.getPiece(x, y);
    if (piece && piece.color === engine.turn) {
      selected = { x, y };
      render();
    }
  }
}

function updateCaptured() {
  const caps = engine.getCaptured();
  capWhiteEl.textContent = caps.filter(p => p.color === 'white').map(p => pieceSymbols[p.type][p.color]).join(' ');
  capBlackEl.textContent = caps.filter(p => p.color === 'black').map(p => pieceSymbols[p.type][p.color]).join(' ');
}

resetBtn.addEventListener('click', () => {
  engine.reset();
  render();
});

render();
