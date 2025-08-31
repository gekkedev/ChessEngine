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

test('reset restores initial state', () => {
  const e = createEngine();
  e.move(0,1,0,3);
  e.move(1,6,1,4);
  e.move(0,3,1,4); // capture
  assert.equal(e.getCaptured().length, 1);
  e.reset();
  assert.equal(e.turn, 'white');
  assert.equal(e.getCaptured().length, 0);
  assert.equal(e.getPiece(0,1).type, 'pawn');
  assert.equal(e.getPiece(1,6).type, 'pawn');
});

test('afterMove plugin is called', () => {
  const e = createEngine();
  let called = false;
  e.addPlugin({ afterMove() { called = true; } });
  e.move(0,1,0,3);
  assert.equal(called, true);
});

test('localization translates names', () => {
  const e = createEngine();
  e.setLanguage('de');
  assert.equal(e.getPieceName('king'), 'K\u00f6nig');
  assert.equal(e.getEventName('check'), 'Schach');
});

test('localization translates labels', () => {
  const e = createEngine();
  e.setLanguage('es');
  assert.equal(e.getCapturedByWhiteLabel(), 'Capturado por blancas:');
  assert.equal(e.getResetLabel(), 'Reiniciar');
});

test('rook movement and blocking', () => {
  const e = createEngine();
  assert.equal(e.move(0,0,0,2), false); // blocked by pawn
  e.board[1][0] = null; // clear path
  assert.equal(e.move(0,0,0,2), true);
  e.turn = 'white';
  assert.equal(e.move(0,2,1,3), false); // diagonal not allowed
});

test('bishop diagonal movement', () => {
  const e = createEngine();
  assert.equal(e.move(2,0,5,3), false); // blocked
  e.board[1][3] = null;
  e.board[2][4] = null;
  assert.equal(e.move(2,0,5,3), true);
  e.turn = 'white';
  assert.equal(e.move(5,3,5,4), false); // vertical not allowed
});

test('knight can jump over pieces', () => {
  const e = createEngine();
  assert.equal(e.move(1,0,2,2), true);
  assert.equal(e.getPiece(2,2).type, 'knight');
});

test('pawn cannot capture forward', () => {
  const e = createEngine();
  e.board[2][0] = { type: 'pawn', color: 'black' };
  assert.equal(e.move(0,1,0,2), false);
});

test('king cannot move into check', () => {
  const e = createEngine();
  // clear the board
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  // place kings and an attacking rook
  e.board[0][4] = { type: 'king', color: 'white' };
  e.board[7][4] = { type: 'rook', color: 'black' };
  e.turn = 'white';
  // king tries to step into rook's line of fire
  assert.equal(e.move(4,0,4,1), false);
});

test('cannot capture the king', () => {
  const e = createEngine();
  // clear board except kings and a white rook
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white' };
  e.board[7][0] = { type: 'king', color: 'black' };
  e.board[0][0] = { type: 'rook', color: 'white' };
  e.turn = 'white';
  // attempt to capture the black king
  assert.equal(e.move(0,0,0,7), false);
});

test('move outside board is rejected', () => {
  const e = createEngine();
  assert.equal(e.move(0,1,0,-1), false); // attempt an out of bounds move
  assert.equal(e.move(0,1,-1,0), false); // different direction
  assert.equal(e.getPiece(0,1).type, 'pawn'); // ensure a pawn exists
});

test('stationary move is not allowed', () => {
  const e = createEngine();
  assert.equal(e.move(0,0,0,0), false);
  assert.equal(e.turn, 'white'); // is it still white's turn?
});

test('onUpdate callback fires for moves, language and reset', () => {
  const e = createEngine();
  let count = 0;
  e.onUpdate = () => { count++; };
  e.move(0,1,0,3); // valid move
  assert.ok(count > 0);
  count = 0;
  e.setLanguage('fr');
  assert.ok(count > 0);
  count = 0;
  e.reset(); // last, but not least: resetting also counts as an update
  assert.ok(count > 0);
});