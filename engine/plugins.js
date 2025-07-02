export class LoggerPlugin {
  beforeMove(engine, piece, move) {
    console.log(`Moving ${piece.color} ${piece.type} from ${move.fromX},${move.fromY} to ${move.toX},${move.toY}`);
  }
}
