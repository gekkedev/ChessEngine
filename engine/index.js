import { LOCALES } from './locales.js';

export class ChessEngine {
  constructor() {
    this.plugins = [];
    this.language = 'en';
    this.onUpdate = null;
    this._listeners = {};
    this.reset();
  }

  reset() {
    // initialize an empty 8x8 board
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.turn = 'white';
    this.captured = [];
    this.lastEvent = null;
    this._placePieces();
    this._emitUpdate();
  }

  _placePieces() {
    const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    // place white pieces
    for (let i = 0; i < 8; i++) {
      this.board[0][i] = { type: backRank[i], color: 'white', hasMoved: false };
      this.board[1][i] = { type: 'pawn', color: 'white', hasMoved: false };
      this.board[6][i] = { type: 'pawn', color: 'black', hasMoved: false };
      this.board[7][i] = { type: backRank[i], color: 'black', hasMoved: false };
    }
  }

  setLanguage(lang) {
    if (LOCALES[lang]) {
      this.language = lang;
      this._emitUpdate();
    }
  }

  _locale() {
    return LOCALES[this.language] || LOCALES.en;
  }

  getPieceName(type) {
    return this._locale().pieces[type] || type;
  }

  getEventName(key) {
    // let plugins provide custom event translations first
    for (const p of this.plugins) {
      if (typeof p.translateEventName === 'function') {
        const t = p.translateEventName(this, key);
        if (t) return t;
      }
    }
    return this._locale().events[key] || key;
  }

  getColorName(color) {
    return this._locale().colors[color] || color;
  }

  getTurnLabel() {
    return this._locale().turn || '';
  }

  getCapturedByWhiteLabel() {
    // rely on default English translations in LOCALES
    return this._locale().capturedWhite;
  }

  getCapturedByBlackLabel() {
    return this._locale().capturedBlack;
  }

  getResetLabel() {
    return this._locale().reset;
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = new Set();
    this._listeners[event].add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._listeners[event]?.delete(handler);
  }

  _emit(event, payload) {
    // notify plugins first
    for (const p of this.plugins) {
      if (typeof p.onEvent === 'function') {
        try { p.onEvent(this, event, payload); } catch {}
      }
    }
    // notify external listeners
    const set = this._listeners[event];
    if (set) {
      for (const fn of Array.from(set)) {
        try { fn(payload, this); } catch {}
      }
    }
  }

  getPiece(x, y) {
    return this.board[y]?.[x] || null;
  }

  move(fromX, fromY, toX, toY, promotionChoice) {
    const piece = this.getPiece(fromX, fromY);
    if (!piece) return false;
    if (piece.color !== this.turn) return false;

    for (const p of this.plugins) {
      if (p.beforeMove && p.beforeMove(this, piece, { fromX, fromY, toX, toY }) === false) {
        return false;
      }
    }

    // detect if this move is a castling attempt for special handling later
    const isCastlingAttempt = piece.type === 'king' && fromY === toY && Math.abs(toX - fromX) === 2;

    if (!this.isValidMove(piece, fromX, fromY, toX, toY)) return false;

    const target = this.getPiece(toX, toY);

    //TODO: move this into isValidMove()
    // capturing a king is not a legal move
    if (target && target.type === 'king') return false;

    // simulate move to ensure it doesn't leave king in check
    this.board[toY][toX] = piece;
    this.board[fromY][fromX] = null;
    const inCheck = this.isCheck(piece.color);
    if (inCheck) {
      // revert the move as it is against the rules
      this.board[fromY][fromX] = piece;
      this.board[toY][toX] = target;
      return false;
    }

    if (target) this.captured.push(target);

    // handle rook movement for castling as a single move
    if (isCastlingAttempt) {
      const step = Math.sign(toX - fromX);
      const rookFromX = step === 1 ? 7 : 0; // kingside rook at file h (7), queenside rook at a (0)
      const rookToX = step === 1 ? 5 : 3;   // rook ends on f (5) or d (3)
      const rook = this.getPiece(rookFromX, fromY);
      if (!rook || rook.type !== 'rook') {
        // should not happen due to validation guard, but keep engine consistent
        this.board[fromY][fromX] = piece;
        this.board[toY][toX] = target;
        return false;
      }
      this.board[fromY][rookFromX] = null;
      this.board[fromY][rookToX] = rook;
      rook.hasMoved = true;
    }

    // mark moved piece to block future castling
    piece.hasMoved = true;

    // handle pawn promotion on reaching last rank
    let didPromotion = false;
    if (piece.type === 'pawn' && (toY === 0 || toY === 7)) {
      const prevCapturedLen = this.captured.length;
      const prevPiece = piece; // reference already on board[toY][toX]
      const handled = this._handlePromotion(piece, toX, toY, promotionChoice);
      if (handled === false) {
        // revert entire move, including capture if any
        this.board[fromY][fromX] = piece;
        this.board[toY][toX] = target;
        piece.hasMoved = false;
        if (target) this.captured.length = prevCapturedLen; // remove last captured
        return false;
      }
      didPromotion = true;
    }

    this.turn = this.turn === 'white' ? 'black' : 'white';
    this._checkEvents();
    if (didPromotion && !this.lastEvent) {
      this.lastEvent = 'promotion';
      // 'promotion' is a state label, not an exclamation event; do not emit
    }

    for (const p of this.plugins) {
      if (p.afterMove) p.afterMove(this, piece, { fromX, fromY, toX, toY });
    }

    this._emitUpdate(); // post-move update trigger
    return true;
  }

  getCaptured() {
    return this.captured;
  }

  getLastEvent() {
    return this.lastEvent;
  }

  _checkEvents() {
    const opponent = this.turn;
    if (this.isCheck(opponent)) {
      this.lastEvent = this.isCheckmate(opponent) ? 'checkmate' : 'check';
      this._emit(this.lastEvent, { color: opponent });
    } else if (this.isGardez(opponent)) {
      this.lastEvent = 'gardez';
      this._emit('gardez', { color: opponent });
    } else {
      this.lastEvent = null;
    }
  }

  _findKing(color) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = this.getPiece(x, y);
        if (p && p.type === 'king' && p.color === color) return { x, y };
      }
    }
    return null;
  }

  isCheck(color) {
    const king = this._findKing(color);
    if (!king) return true;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = this.getPiece(x, y);
        if (p && p.color !== color) {
          if (this.isValidMove(p, x, y, king.x, king.y)) return true;
        }
      }
    }
    return false;
  }

  isCheckmate(color) {
    if (!this.isCheck(color)) return false;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = this.getPiece(x, y);
        if (p && p.color === color) {
          for (let ty = 0; ty < 8; ty++) {
            for (let tx = 0; tx < 8; tx++) {
              if (this.isValidMove(p, x, y, tx, ty)) {
                const orig = this.getPiece(tx, ty);
                this.board[ty][tx] = p;
                this.board[y][x] = null;
                const check = this.isCheck(color);
                this.board[y][x] = p;
                this.board[ty][tx] = orig;
                if (!check) return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  isGardez(color) {
    // queen of given color is under attack
    const queen = this._findQueen(color);
    if (!queen) return false;
    return this._isSquareAttacked(queen.x, queen.y, color);
  }

  isValidMove(piece, fromX, fromY, toX, toY) {
    // ensure that the new coordinates are still on the board
    if (![fromX, fromY, toX, toY].every(n => n >= 0 && n < 8)) return false;

    // moving to the same square would effectively skip a turn
    if (fromX === toX && fromY === toY) return false;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const target = this.getPiece(toX, toY);
    if (target && target.color === piece.color) return false;

    switch (piece.type) {
      case 'pawn':
        return this._validatePawnMove(piece, fromX, fromY, toX, toY, dx, dy, target);
      case 'rook':
        return this._validateRookMove(fromX, fromY, toX, toY);
      case 'bishop':
        return this._validateBishopMove(fromX, fromY, toX, toY);
      case 'queen':
        return (
          this._validateRookMove(fromX, fromY, toX, toY) ||
          this._validateBishopMove(fromX, fromY, toX, toY)
        );
      case 'king':
        if (Math.max(Math.abs(dx), Math.abs(dy)) === 1) return true;
        // Castling: horizontal king move by 2 squares, same rank
        if (dy === 0 && Math.abs(dx) === 2 && !target) {
          // piece.hasMoved may be undefined for pieces created in tests; treat as false by default
          if (piece.hasMoved) return false;
          const step = Math.sign(dx);
          const rookX = step === 1 ? 7 : 0;
          const rook = this.getPiece(rookX, fromY);
          if (!rook || rook.type !== 'rook' || rook.color !== piece.color || rook.hasMoved) return false;
          // squares between king and rook must be empty
          for (let x = fromX + step; x !== rookX; x += step) {
            if (this.getPiece(x, fromY)) return false;
          }
          // king may not be in check, may not pass through or land on attacked squares
          const pathSquares = [
            { x: fromX, y: fromY },
            { x: fromX + step, y: fromY },
            { x: fromX + 2 * step, y: fromY }
          ];
          for (const sq of pathSquares) {
            if (this._isSquareAttacked(sq.x, sq.y, piece.color)) return false;
          }
          return true;
        }
        return false;
      case 'knight':
        return (
          (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
          (Math.abs(dx) === 1 && Math.abs(dy) === 2)
        );
      default:
        return false;
    }
  }

  _isSquareAttacked(x, y, color) {
    const opponent = color === 'white' ? 'black' : 'white';
    for (let yy = 0; yy < 8; yy++) {
      for (let xx = 0; xx < 8; xx++) {
        const p = this.getPiece(xx, yy);
        if (p && p.color === opponent) {
          if (this.isValidMove(p, xx, yy, x, y)) return true;
        }
      }
    }
    return false;
  }

  _findQueen(color) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = this.getPiece(x, y);
        if (p && p.type === 'queen' && p.color === color) return { x, y };
      }
    }
    return null;
  }

  _validatePawnMove(piece, fromX, fromY, toX, toY, dx, dy, target) {
    const dir = piece.color === 'white' ? 1 : -1;
    const startRow = piece.color === 'white' ? 1 : 6;

    if (dx === 0) {
      if (dy === dir && !target) return true;
      if (fromY === startRow && dy === 2 * dir && !target && !this.getPiece(fromX, fromY + dir)) return true;
    }
    if (Math.abs(dx) === 1 && dy === dir && target && target.color !== piece.color) return true;
    return false;
  }

  _validateRookMove(fromX, fromY, toX, toY) {
    if (fromX !== toX && fromY !== toY) return false;
    const stepX = Math.sign(toX - fromX);
    const stepY = Math.sign(toY - fromY);
    let x = fromX + stepX;
    let y = fromY + stepY;
    while (x !== toX || y !== toY) {
      if (this.getPiece(x, y)) return false;
      x += stepX;
      y += stepY;
    }
    return true;
  }

  _validateBishopMove(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (Math.abs(dx) !== Math.abs(dy)) return false;
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    let x = fromX + stepX;
    let y = fromY + stepY;
    while (x !== toX && y !== toY) {
      if (this.getPiece(x, y)) return false;
      x += stepX;
      y += stepY;
    }
    return true;
  }

  _emitUpdate() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this);
    }
  }

  _handlePromotion(pawn, x, y, choice) {
    // allow plugins to override promotion behavior
    for (const p of this.plugins) {
      if (p.onPromotion) {
        const res = p.onPromotion(this, pawn, { x, y, choice });
        if (res === false) return false; // plugin blocked promotion (thus move should be invalid)
        if (res && typeof res === 'object') {
          // plugin returned a piece object to place
          this.board[y][x] = { type: res.type, color: pawn.color, hasMoved: true };
          this.lastEvent = 'revival';
          // 'revival' comes from a plugin and is not an exclamation; do not emit
          return true;
        }
      }
    }
    // default promotion: to specified piece or queen
    const map = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' };
    const t = typeof choice === 'string' ? map[choice.toLowerCase()] : null;
    const toType = t || 'queen';
    this.board[y][x] = { type: toType, color: pawn.color, hasMoved: true };
    return true;
  }
}
