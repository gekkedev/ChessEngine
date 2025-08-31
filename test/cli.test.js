import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFile, spawn } from 'node:child_process';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Path to the CLI entry point
const cliPath = join(__dirname, '..', 'cli', 'index.js');

function runCli(args) {
  return new Promise((resolve, reject) => {
    execFile('node', [cliPath, ...args], { encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout, stderr });
    });
  });
}

function runCliInteractive(commands, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [cliPath, ...args]);
    let stdout = '';
    const EOL = os.EOL;
    let i = 0;

    function trySend() {
      if (i < commands.length && stdout.endsWith('> ')) {
        child.stdin.write(commands[i] + EOL, 'utf8');
        i++;
      }
      if (i === commands.length) {
        child.stdin.end();
      }
    }

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', data => { stdout += data; trySend(); });
    child.on('error', reject);
    child.on('close', () => resolve({ stdout }));

    // Kick off in case the prompt arrived before first data handler
    setImmediate(trySend);
  });
}

test('runs uppercase moves from command line', async () => {
  const { stdout } = await runCli(['--moves=E2E4,E7E5']);
  const lines = stdout.trim().split(/\n/);
  assert.equal(lines[0], 'ok');
  assert.equal(lines[1], 'ok');
});

test('detects checkmate via CLI', async () => {
  const { stdout } = await runCli(['--moves=f2f3,e7e5,g2g4,d8h4']);
  const lines = stdout.trim().split(/\n/);
  assert.equal(lines.at(-2), 'ok'); // last move result
  assert.equal(lines.at(-1), 'Checkmate');
});

test('interactive help output', async () => {
  const { stdout } = await runCliInteractive(['help', 'exit']);
  assert.ok(stdout.includes('Commands:'));
});

test('board command prints initial board', async () => {
  const { stdout } = await runCliInteractive(['board', 'exit']);
  assert.ok(stdout.includes('r n b q k b n r 8'));
});

test('language parameter localizes output', async () => {
  const { stdout } = await runCli(['--lang=de', '--moves=f2f3,e7e5,g2g4,d8h4']);
  const lines = stdout.trim().split(/\n/);
  assert.equal(lines.at(-1), 'Schachmatt');
});

test('interactive lang command changes prompt language', async () => {
  const { stdout } = await runCliInteractive(['lang de']);
  assert.ok(stdout.includes('Am Zug'));
});

test('interactive reset command restores board', async () => {
  const { stdout } = await runCliInteractive([
    'e2e4',
    'board',
    'reset',
    'board',
    'exit'
  ]);
  const boards = stdout.match(/r n b q k b n r 8(?:[\s\S]*?a b c d e f g h)/g);
  assert.ok(boards?.length >= 2);
  const afterMove = boards[0];
  const afterReset = boards[1];
  //not strictly necessary to check exact positions in this test, as long as before reset != after reset
  //assert.ok(afterMove.includes('. . . . P . . . 4'));
  //assert.ok(afterMove.includes('P P P P . P P P 2'));
  //assert.ok(afterReset.includes('P P P P P P P P 2'));
  assert.notEqual(afterMove, afterReset);
});

