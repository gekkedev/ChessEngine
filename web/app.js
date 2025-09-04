import { ChessEngine } from '../engine/index.js';
import { LoggerPlugin, RevivalPromotionPlugin } from '../engine/plugins.js';
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
const langSelectEl = document.getElementById('language');
const themeRadios = Array.from(document.querySelectorAll('input[name="theme"]'));
const revivalToggleEl = document.getElementById('revival-toggle');

const engine = new ChessEngine();
// expose engine globally so other modules like the console can reuse it
window.engine = engine;
engine.addPlugin(new LoggerPlugin());

// Alert on notable events so a browser can react
engine.on('check', () => alert(engine.getEventName('check')));
engine.on('checkmate', () => alert(engine.getEventName('checkmate')));
engine.on('gardez', () => alert(engine.getEventName('gardez')));

// populate language select options
for (const code of Object.keys(LOCALES)) {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = code;
  langSelectEl.appendChild(option);
}

const lang = (navigator.language || 'en').split('-')[0];
if (LOCALES[lang]) {
  engine.setLanguage(lang);
  langSelectEl.value = lang;
}

langSelectEl.addEventListener('change', () => {
  engine.setLanguage(langSelectEl.value);
});

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
  capWhiteLabelEl.textContent = engine.getCapturedByWhiteLabel();
  capBlackLabelEl.textContent = engine.getCapturedByBlackLabel();
  resetBtn.textContent = engine.getResetLabel();
  langSelectEl.value = engine.language;
  updateCaptured();
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const square = document.createElement('div');
      square.className = 'square ' + ((x + y) % 2 ? 'dark' : 'light');
      square.dataset.x = x;
      square.dataset.y = y;
      const piece = engine.getPiece(x, y);
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'piece piece-' + piece.color;
        pieceEl.textContent = pieceSymbols[piece.type][piece.color];
        square.appendChild(pieceEl);
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

// hook the rendering method to the engine to be able to visualize events triggered by the console
engine.onUpdate = render;

function onSquareClick(e) {
  const x = parseInt(e.currentTarget.dataset.x, 10);
  const y = parseInt(e.currentTarget.dataset.y, 10);
  if (selected) {
    /** temporary var while the official selection already gets reset */
    const selectedPiece = selected
    // whether the move will be accepted or rejected, we need to clear the selection:
    // If user clicked the same square, treat as unselect without sending to engine
    if (selectedPiece.x === x && selectedPiece.y === y) {
      selected = null;
      render();
      return;
    }
    selected = null;
    if (engine.move(selectedPiece.x, selectedPiece.y, x, y)) {
      //happens automatically via engine.onUpdate when the move is accepted
      // render();
      return;
    }
    // move was rejected by the engine, so update the board to visualize the cleared selection
    render();
  } else { // highlight the selected piece
    const piece = engine.getPiece(x, y);
    if (piece && piece.color === engine.turn) {
      selected = { x, y };
      render();
    }
  }
}

function updateCaptured() {
  const caps = engine.getCaptured();
  const whiteHtml = caps
    .filter(p => p.color === 'white')
    .map(p => `<span class="piece piece-white">${pieceSymbols[p.type][p.color]}</span>`) 
    .join(' ');
  const blackHtml = caps
    .filter(p => p.color === 'black')
    .map(p => `<span class="piece piece-black">${pieceSymbols[p.type][p.color]}</span>`) 
    .join(' ');
  capWhiteEl.innerHTML = whiteHtml;
  capBlackEl.innerHTML = blackHtml;
}

resetBtn.addEventListener('click', () => {
  engine.reset();
  // render(); //happens automatically via engine.onUpdate
});

render();

// Theme controls (Default | Classic | High contrast)
(function initThemeControls() {
  const saved = localStorage.getItem('theme') || 'default';
  applyTheme(saved);
  const selected = themeRadios.find(r => r.value === saved) || themeRadios[0];
  if (selected) selected.checked = true;

  themeRadios.forEach(r => r.addEventListener('change', () => {
    if (r.checked) {
      applyTheme(r.value);
      localStorage.setItem('theme', r.value);
    }
  }));
})();

function applyTheme(name) {
  document.body.classList.remove('theme-classic', 'theme-high');
  if (name === 'classic') document.body.classList.add('theme-classic');
  else if (name === 'high') document.body.classList.add('theme-high');
}

// Plugin: Revival promotion (toggle)
(function initRevivalPlugin() {
  const plugin = new RevivalPromotionPlugin();
  const key = 'plugin-revival';
  const saved = localStorage.getItem(key) === 'on';
  if (revivalToggleEl) revivalToggleEl.checked = saved;
  if (saved) engine.plugins.push(plugin);

  revivalToggleEl?.addEventListener('change', () => {
    if (revivalToggleEl.checked) {
      if (!engine.plugins.includes(plugin)) engine.plugins.push(plugin);
      localStorage.setItem(key, 'on');
    } else {
      engine.plugins = engine.plugins.filter(p => p !== plugin);
      localStorage.setItem(key, 'off');
    }
  });
})();
