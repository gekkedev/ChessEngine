import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChessEngine } from '../engine/index.js';
import { AristocratsVsPeasantsPlugin } from '../engine/plugins.js';

test('Aristocrats vs. Peasants: black peasants, white aristocrats setup', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  // via engine config API with default
  e.setPluginConfig(plugin, { peasants: 'black' });
  e.reset();

  // White back rank pieces on y=0, no white pawns on y=1
  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let x = 0; x < 8; x++) {
    assert.equal(e.getPiece(x, 0)?.type, backRank[x]);
    assert.equal(e.getPiece(x, 0)?.color, 'white');
    assert.equal(e.getPiece(x, 1), null); // no white pawns
  }

  // Black peasants: pawns on y=6 and y=5; king on e8 (y=7,x=4)
  for (let x = 0; x < 8; x++) {
    assert.equal(e.getPiece(x, 6)?.type, 'pawn');
    assert.equal(e.getPiece(x, 6)?.color, 'black');
    assert.equal(e.getPiece(x, 5)?.type, 'pawn');
    assert.equal(e.getPiece(x, 5)?.color, 'black');
  }
  assert.equal(e.getPiece(4, 7)?.type, 'king');
  assert.equal(e.getPiece(4, 7)?.color, 'black');
});

test('Aristocrats vs. Peasants: white peasants, black aristocrats setup', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  // configure via engine to white peasants
  e.setPluginConfig(plugin, { peasants: 'white' });
  e.reset();

  // Black back rank pieces on y=7, no black pawns on y=6
  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let x = 0; x < 8; x++) {
    assert.equal(e.getPiece(x, 7)?.type, backRank[x]);
    assert.equal(e.getPiece(x, 7)?.color, 'black');
    assert.equal(e.getPiece(x, 6), null); // no black pawns
  }

  // White peasants: pawns on y=1 and y=2; king on e1 (y=0,x=4)
  for (let x = 0; x < 8; x++) {
    assert.equal(e.getPiece(x, 1)?.type, 'pawn');
    assert.equal(e.getPiece(x, 1)?.color, 'white');
    assert.equal(e.getPiece(x, 2)?.type, 'pawn');
    assert.equal(e.getPiece(x, 2)?.color, 'white');
  }
  assert.equal(e.getPiece(4, 0)?.type, 'king');
  assert.equal(e.getPiece(4, 0)?.color, 'white');
});
test('Aristocrats vs. Peasants: plugin exposes config spec and current config', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  const spec = plugin.getConfigSpec(e);
  assert.equal(spec.peasants.type, 'enum');
  assert.deepEqual(spec.peasants.options.sort(), ['white','black'].sort());
  assert.equal(spec.peasants.default, 'black');
  assert.equal(plugin.getConfig().peasants, 'black');
  e.setPluginConfig(plugin, { peasants: 'white' });
  assert.equal(plugin.getConfig().peasants, 'white');
});
