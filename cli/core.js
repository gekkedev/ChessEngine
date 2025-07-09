import { ChessEngine } from '../engine/index.js';

export class ChessCLI {
  constructor(lang) {
    this.engine = new ChessEngine();
    if (lang) this.engine.setLanguage(lang);
  }

  posToCoord(pos) {
    // allow both uppercase and lowercase coordinates
    const p = pos.toLowerCase();
    const files = 'abcdefgh';
    const x = files.indexOf(p[0]);
    const y = Number(p[1]) - 1;
    return [x, y];
  }

  pieceChar(piece) {
    const map = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };
    const ch = map[piece.type] || '?';
    return piece.color === 'white' ? ch.toUpperCase() : ch;
  }

  board() {
    const files = 'abcdefgh';
    for (let y = 7; y >= 0; y--) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const p = this.engine.getPiece(x, y);
        row += (p ? this.pieceChar(p) : '.') + ' ';
      }
      console.log(row.trim() + " " + (y + 1));
    }
    console.log(files.split('').join(' '));
  }

  getPrompt() {
    return `${this.engine.getTurnLabel()} (${this.engine.getColorName(this.engine.turn)})> `;
  }

  move(cmd) {
    const [from, to] = [cmd.slice(0, 2), cmd.slice(2, 4)];
    const coords = [...this.posToCoord(from), ...this.posToCoord(to)];
    const ok = this.engine.move(...coords);
    console.log(ok ? 'ok' : 'invalid');
    if (this.engine.getLastEvent()) {
      console.log(this.engine.getEventName(this.engine.getLastEvent()));
    }
  }

  lang(code) {
    if (code) this.engine.setLanguage(code);
  }

  reset() {
    this.engine.reset();
    console.log(this.engine.getResetLabel());
  }

  help() {
    console.log('Commands: help, board, lang <code>, reset, exit, <move>');
  }
}
