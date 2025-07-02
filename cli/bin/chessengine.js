#!/usr/bin/env node
import { ChessEngine } from '../../engine/index.js';
import readline from 'node:readline/promises';
import process from 'node:process';

function posToCoord(pos) {
  const files = 'abcdefgh';
  const x = files.indexOf(pos[0]);
  const y = Number(pos[1]) - 1;
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

if (process.stdin.isTTY) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const engine = new ChessEngine();
  console.log('Type moves like e2e4. Type "exit" to quit.');
  async function loop() {
    const prompt = `${engine.getTurnLabel()} ${engine.getColorName(engine.turn)}> `;
    const answer = await rl.question(prompt);
    if (answer === 'exit') { rl.close(); return; }
    if (answer.length < 4) { console.log('Invalid format'); return loop(); }
    const [from, to] = [answer.slice(0,2), answer.slice(2,4)];
    const coords = [...posToCoord(from), ...posToCoord(to)];
    const ok = engine.move(...coords);
    console.log(ok ? 'ok' : 'invalid');
    if (engine.getLastEvent()) {
      console.log(engine.getEventName(engine.getLastEvent()));
    }
    await loop();
  }
  loop();
} else {
  usage();
  process.exit(1);
}
