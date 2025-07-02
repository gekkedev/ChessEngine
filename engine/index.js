export class ChessEngine {
  constructor() {
    this.plugins = [];
    this.reset();
  }

  reset() {
    // initialize empty 8x8 board
    this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    this.turn = 'white';
    this._placePieces();
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

    this.board[toY][toX] = piece;
    this.board[fromY][fromX] = null;
    this.turn = this.turn === 'white' ? 'black' : 'white';

    for (const p of this.plugins) {
      if (p.afterMove) p.afterMove(this, piece, { fromX, fromY, toX, toY });
    }

    return true;
  }

  isValidMove(piece, fromX, fromY, toX, toY) {
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
}
