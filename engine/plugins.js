export class LoggerPlugin {
  beforeMove(engine, piece, move) {
    console.log(`Moving ${piece.color} ${piece.type} from ${move.fromX},${move.fromY} to ${move.toX},${move.toY}`);
  }
}

// RevivalPromotionPlugin: replaces standard promotion with revival.
// When a pawn reaches the last rank, it must revive one of its own captured pieces
// (if any). If a choice is provided, it must be available among captured pieces.
// If no own captured pieces are available, the promoting move is rejected.
export class RevivalPromotionPlugin {
  beforeMove(engine, piece, move) {
    // block moving a pawn to last rank when there are no friendly captured pieces to revive
    if (piece.type === 'pawn') {
      const lastRank = piece.color === 'white' ? 7 : 0;
      if (move.toY === lastRank) {
        const hasFriendlyCaptured = engine.captured.some(
          p => p.color === piece.color && p.type !== 'king'
        );
        if (!hasFriendlyCaptured) return false;
      }
    }
  }

  onPromotion(engine, pawn, { x, y, choice }) {
    const order = ['queen', 'rook', 'bishop', 'knight', 'pawn'];
    const pool = engine.captured.filter(p => p.color === pawn.color && p.type !== 'king');
    if (pool.length === 0) return false;

    let desired = null;
    if (typeof choice === 'string') {
      const map = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
      desired = map[choice.toLowerCase()] || null;
    }

    let reviveType = desired;
    if (!reviveType) {
      // pick highest value available
      reviveType = order.find(t => pool.some(p => p.type === t));
    }

    if (!reviveType || !pool.some(p => p.type === reviveType)) return false; // cannot fulfill

    // remove one instance from captured and return the revived piece
    const idx = engine.captured.findIndex(p => p.color === pawn.color && p.type === reviveType);
    if (idx >= 0) engine.captured.splice(idx, 1);
    return { type: reviveType };
  }

  translateEventName(engine, key) {
    if (key !== 'revival') return null;
    const names = {
      en: 'Revival',
      de: 'Wiederbelebung',
      fr: 'R\u00e9surrection',
      es: 'Resurrecci\u00f3n',
      it: 'Resurrezione',
      zh_TW: '\u5fa9\u6d3b',
      uk: '\u0412\u0456\u0434\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f'
    };
    return names[engine.language] || names.en;
  }
}
