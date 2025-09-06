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

test('AVP white peasants: front rank double-step allowed, back rank blocked by front pawn', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  e.setPluginConfig(plugin, { peasants: 'white' });
  e.reset();
  // Front rank pawn at y=2 should move two to y=4
  // Use file a (x=0): from (0,2) -> (0,4)
  e.turn = 'white';
  assert.equal(e.move(0,2,0,4), true);
  // Back rank pawn at y=1 cannot jump two initially because (0,2) was occupied before the move
  // Try a different file where front pawn still blocks: file b (x=1): from (1,1) -> (1,3) should be false now
  assert.equal(e.move(1,1,1,3), false);
});

test('AVP black peasants: front rank double-step allowed, back rank blocked by front pawn', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  e.setPluginConfig(plugin, { peasants: 'black' });
  e.reset();
  // Make it black's turn to test their move
  e.turn = 'black';
  // Front rank pawn at y=5 should move two to y=3
  assert.equal(e.move(0,5,0,3), true);
  // Back rank pawn at y=6 on another file is blocked by front pawn at y=5
  assert.equal(e.move(1,6,1,4), false);
});

test('AVP back rank double-step becomes available after front pawn advances', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  e.setPluginConfig(plugin, { peasants: 'white' });
  e.reset();
  // White moves front pawn from (0,2) to (0,4)
  e.turn = 'white';
  assert.equal(e.move(0,2,0,4), true);
  // Black makes any legal move that doesn't interfere; move a back rank piece one step to pass the turn
  // Move black knight from b8 (1,7) to a5 (0,5) is not a valid knight move; use (1,7)->(0,5) is valid (2,1)? Knight moves L; from (1,7) to (0,5) dy -2 dx -1 => valid.
  assert.equal(e.move(1,7,0,5), true);
  // Now white back rank pawn at (0,1) should be able to double-step to (0,3)
  assert.equal(e.move(0,1,0,3), true);
});

test('AVP: sequence D6D5, D5D4, D3D3(pass), D7D6 then D6D4 is blocked', () => {
  const e = new ChessEngine();
  const plugin = new AristocratsVsPeasantsPlugin();
  e.addPlugin(plugin);
  e.setPluginConfig(plugin, { peasants: 'black' });
  e.reset();
  e.turn = 'black';
  // D6D5
  assert.equal(e.move(3,5,3,4), true);
  // White pass move: g1->f3
  assert.equal(e.move(6,0,5,2), true);
  // D5D4
  assert.equal(e.move(3,4,3,3), true);
  // D3D3(pass): simulate with b1->a3
  assert.equal(e.move(1,0,0,2), true);
  // D7D6
  assert.equal(e.move(3,6,3,5), true);
  // White pass move back: f3->g1
  assert.equal(e.move(5,2,6,0), true);
  // D6D4 should be blocked
  assert.equal(e.move(3,5,3,3), false);
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
