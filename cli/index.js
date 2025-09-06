#!/usr/bin/env node
import { ChessCLI } from './core.js';
import { RevivalPromotionPlugin, AristocratsVsPeasantsPlugin } from '../engine/plugins.js';
import readline from 'node:readline/promises';
import process from 'node:process';

const movesArg = process.argv.find(a => a.startsWith('--moves='));
const langArg = process.argv.find(a => a.startsWith('--lang='));
const revivalEnabled = process.argv.includes('--revival');
const avpEnabled = process.argv.includes('--avp');
const avpPeasantsArg = process.argv.find(a => a.startsWith('--avp-peasants='));
const cli = new ChessCLI(langArg && langArg.slice('--lang='.length));
if (revivalEnabled) cli.engine.addPlugin(new RevivalPromotionPlugin());
if (avpEnabled) {
  const peasants = avpPeasantsArg ? avpPeasantsArg.split('=')[1] : undefined;
  const plugin = new AristocratsVsPeasantsPlugin({ peasants });
  cli.engine.addPlugin(plugin);
  // Ensure initial placement uses the variant
  cli.engine.reset();
}

if (movesArg) {
  const moves = movesArg.slice('--moves='.length).split(',');
  for (const m of moves) cli.move(m);
  process.exit(0);
} else {
  // interactive mode
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('Type moves like e2e4. Type "help" for commands.');
  async function loop() {
    const answer = (await rl.question(cli.getPrompt())).trim();
    if (answer === 'exit') { rl.close(); return; }
    if (answer === 'help') { cli.help(); return loop(); }
    if (answer === 'board') { cli.board(); return loop(); }
    if (answer === 'captured') { cli.captured(); return loop(); }
    if (answer.startsWith('lang ')) { cli.lang(answer.split(/\s+/)[1]); return loop(); }
    if (answer === 'reset') { cli.reset(); return loop(); }
    if (answer.length < 4) { console.log('Invalid format'); return loop(); }
    cli.move(answer);
    return loop();
  }
  loop();
}
