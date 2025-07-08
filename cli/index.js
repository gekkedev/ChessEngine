#!/usr/bin/env node
// Import the engine one directory up
import { ChessEngine } from '../engine/index.js';
import readline from 'node:readline/promises';
import process from 'node:process';

function posToCoord(pos) {
  // allow both uppercase and lowercase coordinates
  const p = pos.toLowerCase();
  const files = 'abcdefgh';
  const x = files.indexOf(p[0]);
  const y = Number(p[1]) - 1;
  return [x, y];
}

function usage() {
  console.log('Usage: chessengine [--moves=a2a4,b7b5]');
}

const movesArg = process.argv.find(a => a.startsWith('--moves='));
if (movesArg) {
  const moves = movesArg.slice('--moves='.length).split(',');
  const engine = new ChessEngine();
  for (const m of moves) {
    const [from, to] = [m.slice(0,2), m.slice(2,4)];
    const coords = [...posToCoord(from), ...posToCoord(to)];
    const ok = engine.move(...coords);
    console.log(ok ? 'ok' : 'invalid');
    if (engine.getLastEvent()) {
      console.log(engine.getEventName(engine.getLastEvent()));
    }
  }
  process.exit(0);
}

if (!movesArg) {
  // Start interactive REPL when no moves are provided.
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const engine = new ChessEngine();
  console.log('Type moves like e2e4. Type "help" for commands.');

  // Convert internal piece representation to a single character.
  // White pieces are printed in uppercase.
  function pieceChar(piece) {
    const map = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };
    const ch = map[piece.type] || '?';
    return piece.color === 'white' ? ch.toUpperCase() : ch;
  }

  function showBoard() {
    // Print board from Black's perspective at the top.
    const files = 'abcdefgh';
    for (let y = 7; y >= 0; y--) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const p = engine.getPiece(x, y);
        row += (p ? pieceChar(p) : '.') + ' ';
      }
      console.log(row.trim(), y + 1);
    }
    console.log(files.split('').join(' '));
  }

  function showCaptured() {
    const caps = engine.getCaptured();
    // pieces captured by white are black pieces
    const byWhite = caps.filter(p => p.color === 'black').map(pieceChar).join(' ');
    const byBlack = caps.filter(p => p.color === 'white').map(pieceChar).join(' ');
    console.log(engine.getCapturedByWhiteLabel(), byWhite || '-');
    console.log(engine.getCapturedByBlackLabel(), byBlack || '-');
  }

  async function loop() {
    // Show the turn label with color name in parentheses
    const prompt = `${engine.getTurnLabel()} (${engine.getColorName(engine.turn)})> `;
    const answer = (await rl.question(prompt)).trim();
    if (answer === 'exit') { rl.close(); return; }
    if (answer === 'help') {
      console.log('Commands: help, board, captured, exit, <move>');
      return loop();
    }
    if (answer === 'board') {
      showBoard();
      return loop();
    }
    if (answer === 'captured') {
      showCaptured();
      return loop();
    }
    if (answer.length < 4) { console.log('Invalid format'); return loop(); }
    const [from, to] = [answer.slice(0,2), answer.slice(2,4)];
    const coords = [...posToCoord(from), ...posToCoord(to)];
    const ok = engine.move(...coords);
    console.log(ok ? 'ok' : 'invalid');
    if (engine.getLastEvent()) {
      console.log(engine.getEventName(engine.getLastEvent()));
    }
    return loop();
  }
  loop();
}
