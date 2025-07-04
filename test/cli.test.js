import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFile, spawn } from 'node:child_process';

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

function runCliInteractive(commands) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [cliPath], { encoding: 'utf8' });
    let stdout = '';
    child.stdout.on('data', data => { stdout += data; });
    child.on('error', reject);
    child.on('close', () => resolve({ stdout }));
    for (const cmd of commands) {
      child.stdin.write(cmd + '\n');
    }
    child.stdin.end();
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
