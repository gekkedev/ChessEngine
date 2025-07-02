import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChessEngine } from '../engine/index.js';

function createEngine() {
  const engine = new ChessEngine();
  return engine;
}

test('initial board setup', () => {
  const engine = createEngine();
  assert.equal(engine.getPiece(0,0).type, 'rook');
  assert.equal(engine.getPiece(4,0).type, 'king');
  assert.equal(engine.getPiece(3,7).type, 'queen');
  assert.equal(engine.turn, 'white');
});

test('basic moves and captures', () => {
  const engine = createEngine();
  // invalid: black piece on white turn
  assert.equal(engine.move(0,7,0,5), false);

  // white pawn two step
  assert.equal(engine.move(0,1,0,3), true);
  // black pawn two step
  assert.equal(engine.move(1,6,1,4), true);
  // capture pawn
  assert.equal(engine.move(0,3,1,4), true);

  const captured = engine.getCaptured();
  assert.equal(captured.length, 1);
  assert.equal(captured[0].type, 'pawn');
  assert.equal(captured[0].color, 'black');
});

test('check detection', () => {
  const e = createEngine();
  e.move(4,1,4,3); // e2 -> e4
  e.move(4,6,4,4); // e7 -> e5
  e.move(5,0,2,3); // Bf1 -> c4
  e.move(1,7,2,5); // Nb8 -> c6
  e.move(2,3,5,6); // Bc4 x f7 +
  assert.equal(e.getLastEvent(), 'check');
});

test('checkmate detection', () => {
  const e = createEngine();
  e.move(5,1,5,2); // f2 -> f3
  e.move(4,6,4,4); // e7 -> e5
  e.move(6,1,6,3); // g2 -> g4
  e.move(3,7,7,3); // Qd8 -> h4 #
  assert.equal(e.getLastEvent(), 'checkmate');
});

test('plugin can block moves', () => {
  const e = createEngine();
  const blocker = { beforeMove: () => false };
  e.addPlugin(blocker);
  assert.equal(e.move(0,1,0,3), false);
});
