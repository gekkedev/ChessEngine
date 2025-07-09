import { LOCALES } from './locales.js';

export class ChessEngine {
  constructor() {
    this.plugins = [];
    this.language = 'en';
    this.onUpdate = null;
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
      this.board[0][i] = { type: backRank[i], color: 'white' };
      this.board[1][i] = { type: 'pawn', color: 'white' };
      this.board[6][i] = { type: 'pawn', color: 'black' };
      this.board[7][i] = { type: backRank[i], color: 'black' };
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

  getPiece(x, y) {
    return this.board[y]?.[x] || null;
  }

  move(fromX, fromY, toX, toY) {
    const piece = this.getPiece(fromX, fromY);
    if (!piece) return false;
    if (piece.color !== this.turn) return false;

    for (const p of this.plugins) {
      if (p.beforeMove && p.beforeMove(this, piece, { fromX, fromY, toX, toY }) === false) {
        return false;
      }
    }

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

    this.turn = this.turn === 'white' ? 'black' : 'white';
    this._checkEvents();

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
        return Math.max(Math.abs(dx), Math.abs(dy)) === 1;
      case 'knight':
        return (
          (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
          (Math.abs(dx) === 1 && Math.abs(dy) === 2)
        );
      default:
        return false;
    }
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
}
