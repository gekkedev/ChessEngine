#!/usr/bin/env node
import { ChessCLI } from './core.js';
import readline from 'node:readline/promises';
import process from 'node:process';

function usage() {
  console.log('Usage: chessengine [--moves=a2a4,b7b5] [--lang=de]');
}

const movesArg = process.argv.find(a => a.startsWith('--moves='));
const langArg = process.argv.find(a => a.startsWith('--lang='));
const cli = new ChessCLI(langArg && langArg.slice('--lang='.length));

if (movesArg) {
  const moves = movesArg.slice('--moves='.length).split(',');
  for (const m of moves) cli.move(m);
  process.exit(0);
}

if (!movesArg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('Type moves like e2e4. Type "help" for commands.');

  async function loop() {
    const answer = (await rl.question(cli.getPrompt())).trim();
    if (answer === 'exit') { rl.close(); return; }
    if (answer === 'help') { cli.help(); return loop(); }
    if (answer === 'board') { cli.board(); return loop(); }
    if (answer.startsWith('lang ')) { cli.lang(answer.split(/\s+/)[1]); return loop(); }
    if (answer === 'reset') { cli.reset(); return loop(); }
    if (answer.length < 4) { console.log('Invalid format'); return loop(); }
    cli.move(answer);
    return loop();
  }
  loop();
}
