import { ChessEngine } from '../engine/index.js';
import { LOCALES } from '../engine/locales.js';

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

  captured() {
    const caps = this.engine.getCaptured();
    const byWhite = caps.filter(p => p.color === 'black').map(p => this.pieceChar(p)).join(' ');
    const byBlack = caps.filter(p => p.color === 'white').map(p => this.pieceChar(p)).join(' ');
    console.log(this.engine.getCapturedByWhiteLabel(), byWhite || '-');
    console.log(this.engine.getCapturedByBlackLabel(), byBlack || '-');
  }

  getPrompt() {
    return `${this.engine.getTurnLabel()} (${this.engine.getColorName(this.engine.turn)})> `;
  }

  move(cmd) {
    const input = cmd.trim();
    const [from, to] = [input.slice(0, 2), input.slice(2, 4)];
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
    const loc = LOCALES[this.engine.language] || LOCALES.en;
    console.log(loc.helpCommands || 'Commands: help, board, captured, lang <code>, reset, exit, <move>');
    console.log(loc.helpMoves || 'Moves: coordinates like e2e4; castle by moving the king to g/c');
  }
}
