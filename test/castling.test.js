import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChessEngine } from '../engine/index.js';

function createEngine() { return new ChessEngine(); }

test('castling: white kingside (O-O)', () => {
  const e = createEngine();
  // minimal setup: only kings and rook
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false }; // e1
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false }; // h1
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false }; // a8
  e.turn = 'white';
  assert.equal(e.move(4,0,6,0), true); // e1 -> g1
  assert.equal(e.getPiece(6,0)?.type, 'king');
  assert.equal(e.getPiece(6,0)?.color, 'white');
  assert.equal(e.getPiece(5,0)?.type, 'rook'); // rook moved to f1
  assert.equal(e.getPiece(5,0)?.color, 'white');
});

test('castling: black queenside (O-O-O)', () => {
  const e = createEngine();
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[7][4] = { type: 'king', color: 'black', hasMoved: false }; // e8
  e.board[7][0] = { type: 'rook', color: 'black', hasMoved: false }; // a8
  e.board[0][7] = { type: 'king', color: 'white', hasMoved: false }; // h1
  e.turn = 'black';
  assert.equal(e.move(4,7,2,7), true); // e8 -> c8
  assert.equal(e.getPiece(2,7)?.type, 'king');
  assert.equal(e.getPiece(2,7)?.color, 'black');
  assert.equal(e.getPiece(3,7)?.type, 'rook'); // rook moved to d8
  assert.equal(e.getPiece(3,7)?.color, 'black');
});

test('castling is illegal when passing through check', () => {
  const e = createEngine();
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false }; // e1
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false }; // h1
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false }; // a8
  e.board[7][5] = { type: 'rook', color: 'black', hasMoved: false }; // f8 attacks f1
  e.turn = 'white';
  assert.equal(e.move(4,0,6,0), false);
});

test('castling is illegal while in check', () => {
  const e = createEngine();
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false }; // e1
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false }; // h1
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false }; // a8
  e.board[7][4] = { type: 'rook', color: 'black', hasMoved: false }; // e8 attacks e1 directly
  e.turn = 'white';
  assert.equal(e.move(4,0,6,0), false);
});

test('castling not allowed after king or rook moves', () => {
  const e = createEngine();
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: true }; // king has moved before
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false };
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false };
  e.turn = 'white';
  assert.equal(e.move(4,0,6,0), false);

  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false };
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: true }; // rook has moved before
  assert.equal(e.move(4,0,6,0), false);
});

test('cannot finish castling after moving king one square earlier', () => {
  const e = createEngine();
  // minimal setup
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false }; // e1
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false }; // h1
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false }; // a8
  e.turn = 'white';
  // white moves king one square to f1 (not castling)
  assert.equal(e.move(4,0,5,0), true);
  // black makes a dummy legal move
  assert.equal(e.move(0,7,0,6), true);
  // even if king returns to e1, castling is no longer allowed
  assert.equal(e.move(5,0,4,0), true);
  // black dummy move
  assert.equal(e.move(0,6,0,5), true);
  // attempt to castle after king has moved before
  assert.equal(e.move(4,0,6,0), false);
});

test('cannot castle after rook moved away and back', () => {
  const e = createEngine();
  // minimal setup
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][4] = { type: 'king', color: 'white', hasMoved: false }; // e1
  e.board[0][7] = { type: 'rook', color: 'white', hasMoved: false }; // h1
  e.board[7][0] = { type: 'king', color: 'black', hasMoved: false }; // a8
  e.turn = 'white';
  // move rook away and back
  assert.equal(e.move(7,0,7,1), true); // h1 -> h2
  assert.equal(e.move(0,7,0,6), true); // black king a8 -> a7
  assert.equal(e.move(7,1,7,0), true); // h2 -> h1
  assert.equal(e.move(0,6,0,5), true); // black king a7 -> a6
  // attempt to castle after rook moved before
  assert.equal(e.move(4,0,6,0), false);
});
