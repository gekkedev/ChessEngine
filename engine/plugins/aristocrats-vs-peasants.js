// AristocratsVsPeasantsPlugin: Variant "Aristocrats vs. Peasants" (Aristokraten gegen Bauern)
// One side (aristocrats) has the regular back rank pieces without pawns.
// The other side (peasants) has two full ranks of pawns and only a king behind them.
// This plugin must be active at setup time; toggling mid-game has no effect on board state.
export class AristocratsVsPeasantsPlugin {
  // peasants: 'white' | 'black' (which color is the peasant side)
  constructor({ peasants = 'black' } = {}) {
    this.peasants = peasants === 'white' ? 'white' : 'black';
  }

  getDisplayName(engine) {
    const names = {
      en: 'Aristocrats vs. Peasants',
      de: 'Aristokraten gegen Bauern',
      fr: 'Aristocrates contre Paysans',
      es: 'Aristócratas contra Campesinos',
      it: 'Aristocratici contro Contadini',
      zh_TW: '貴族對農民',
      uk: 'Аристократи проти селян'
    };
    const code = engine?.language || 'en';
    return names[code] || names.en;
  }

  setupBoard(engine) {
    const peasants = this.peasants;
    const aristocrats = peasants === 'white' ? 'black' : 'white';
    const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    engine.board = Array.from({ length: 8 }, () => Array(8).fill(null));
    // Aristocrats: back rank pieces only (no pawns)
    const aristY = aristocrats === 'white' ? 0 : 7;
    for (let x = 0; x < 8; x++) {
      engine.board[aristY][x] = { type: backRank[x], color: aristocrats, hasMoved: false };
    }
    // Peasants: two full ranks of pawns in front of their king row, plus king on home square
    if (peasants === 'white') {
      // place king at e1 (x=4,y=0), pawns at ranks 2 and 3 (y=1 and y=2)
      engine.board[0][4] = { type: 'king', color: 'white', hasMoved: false };
      for (let x = 0; x < 8; x++) {
        engine.board[1][x] = { type: 'pawn', color: 'white', hasMoved: false };
        engine.board[2][x] = { type: 'pawn', color: 'white', hasMoved: false };
      }
    } else {
      // peasants are black: king at e8 (x=4,y=7), pawns at ranks 7 and 6 (y=6 and y=5)
      engine.board[7][4] = { type: 'king', color: 'black', hasMoved: false };
      for (let x = 0; x < 8; x++) {
        engine.board[6][x] = { type: 'pawn', color: 'black', hasMoved: false };
        engine.board[5][x] = { type: 'pawn', color: 'black', hasMoved: false };
      }
    }
    engine.turn = 'white';
    engine.captured = [];
    engine.lastEvent = null;
    return true;
  }
}
