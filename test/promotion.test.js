import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChessEngine } from '../engine/index.js';
import { RevivalPromotionPlugin } from '../engine/plugins.js';

test('pawn promotes to queen by default', () => {
  const e = new ChessEngine();
  // minimal board with kings and a white pawn ready to promote
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][0] = { type: 'pawn', color: 'white', hasMoved: false };
  e.turn = 'white';
  assert.equal(e.move(0,6,0,7), true);
  assert.equal(e.getPiece(0,7).type, 'queen');
  assert.equal(e.getLastEvent() === 'promotion' || e.getLastEvent() === 'check' || e.getLastEvent() === 'checkmate', true);
});

test('pawn promotion choice to knight', () => {
  const e = new ChessEngine();
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][1] = { type: 'pawn', color: 'white', hasMoved: false };
  e.turn = 'white';
  assert.equal(e.move(1,6,1,7, 'n'), true);
  assert.equal(e.getPiece(1,7).type, 'knight');
});

test('revival plugin allows last-rank entry but no promotion when no friendly captured piece', () => {
  const e = new ChessEngine();
  e.addPlugin(new RevivalPromotionPlugin());
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][2] = { type: 'pawn', color: 'white', hasMoved: false };
  e.turn = 'white';
  assert.equal(e.move(2,6,2,7), true);
  assert.equal(e.getPiece(2,7)?.type, 'pawn');
});

test('revival plugin revives chosen piece and removes from captured', () => {
  const e = new ChessEngine();
  e.addPlugin(new RevivalPromotionPlugin());
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][3] = { type: 'pawn', color: 'white', hasMoved: false };
  // simulate that white lost a rook earlier
  e.captured.push({ type: 'rook', color: 'white' });
  e.turn = 'white';
  assert.equal(e.move(3,6,3,7, 'r'), true);
  assert.equal(e.getPiece(3,7).type, 'rook');
  // captured list should be empty now for that rook
  assert.equal(e.captured.some(p => p.type === 'rook' && p.color === 'white'), false);
  // last event can be revival or check states depending on positions
  assert.equal(['revival', 'check', 'checkmate', null].includes(e.getLastEvent()), true);
});

test('revival plugin auto-picks best available when no choice given', () => {
  const e = new ChessEngine();
  e.addPlugin(new RevivalPromotionPlugin());
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][4] = { type: 'pawn', color: 'white', hasMoved: false };
  e.captured.push({ type: 'bishop', color: 'white' });
  e.captured.push({ type: 'knight', color: 'white' });
  e.turn = 'white';
  assert.equal(e.move(4,6,4,7), true);
  assert.equal(e.getPiece(4,7).type, 'bishop');
});

test('revival event localized by plugin', () => {
  const e = new ChessEngine();
  e.addPlugin(new RevivalPromotionPlugin());
  e.setLanguage('de');
  // translation should come from plugin, not core locales
  assert.equal(e.getEventName('revival'), 'Wiederbelebung');
});

test('revival plugin with explicit choice but nothing to revive: enter last rank and no promotion', () => {
  const e = new ChessEngine();
  e.addPlugin(new RevivalPromotionPlugin());
  e.board = Array.from({ length: 8 }, () => Array(8).fill(null));
  e.board[0][0] = { type: 'king', color: 'white', hasMoved: false };
  e.board[7][7] = { type: 'king', color: 'black', hasMoved: false };
  e.board[6][5] = { type: 'pawn', color: 'white', hasMoved: false };
  e.turn = 'white';
  // Provide a promotion choice, but there is nothing to revive
  assert.equal(e.move(5,6,5,7, 'n'), true);
  assert.equal(e.getPiece(5,7)?.type, 'pawn');
});
