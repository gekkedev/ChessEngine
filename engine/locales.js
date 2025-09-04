export const LOCALES = {
  en: {
    pieces: { pawn: 'Pawn', rook: 'Rook', knight: 'Knight', bishop: 'Bishop', queen: 'Queen', king: 'King' },
    colors: { white: 'White', black: 'Black' },
    events: { check: 'Check', checkmate: 'Checkmate', promotion: 'Promotion' },
    turn: 'Turn',
    helpCommands: 'Commands: help, board, captured, lang <code>, reset, exit, <move>',
    helpMoves: 'Moves: e2e4; castle by moving the king to g/c; promote with e7e8=Q',
    capturedWhite: 'Captured by white:',
    capturedBlack: 'Captured by black:',
    reset: 'Reset'
  },
  de: {
    pieces: { pawn: 'Bauer', rook: 'Turm', knight: 'Springer', bishop: 'L\u00e4ufer', queen: 'Dame', king: 'K\u00f6nig' },
    colors: { white: 'Wei\u00df', black: 'Schwarz' },
    events: { check: 'Schach', checkmate: 'Schachmatt', promotion: 'Umwandlung' },
    turn: 'Am Zug',
    helpCommands: 'Befehle: help, board, captured, lang <code>, reset, exit, <zug>',
    helpMoves: 'Z\u00fcge: e2e4; Rochade mit K\u00f6nig nach g/c; Umwandlung mit e7e8=Q',
    capturedWhite: 'Von Wei\u00df geschlagen:',
    capturedBlack: 'Von Schwarz geschlagen:',
    reset: 'Zur\u00fccksetzen'
  },
  fr: {
    pieces: { pawn: 'Pion', rook: 'Tour', knight: 'Cavalier', bishop: 'Fou', queen: 'Dame', king: 'Roi' },
    colors: { white: 'Blanc', black: 'Noir' },
    events: { check: '\u00c9chec', checkmate: '\u00c9chec et mat', promotion: 'Promotion' },
    turn: 'Tour',
    helpCommands: 'Commandes : help, board, captured, lang <code>, reset, exit, <coup>',
    helpMoves: 'Coups : e2e4 ; roque en d\u00e9pla\u00e7ant le roi vers g/c ; promotion avec e7e8=Q',
    capturedWhite: 'Pris par les blancs :',
    capturedBlack: 'Pris par les noirs :',
    reset: '\u00c9initialiser'
  },
  es: {
    pieces: { pawn: 'Pe\u00f3n', rook: 'Torre', knight: 'Caballo', bishop: 'Alfil', queen: 'Reina', king: 'Rey' },
    colors: { white: 'Blanco', black: 'Negro' },
    events: { check: 'Jaque', checkmate: 'Jaque mate', promotion: 'Promoci\u00f3n' },
    turn: 'Turno',
    helpCommands: 'Comandos: help, board, captured, lang <code>, reset, exit, <movida>',
    helpMoves: 'Movidas: e2e4; enroque moviendo el rey a g/c; promoci\u00f3n con e7e8=Q',
    capturedWhite: 'Capturado por blancas:',
    capturedBlack: 'Capturado por negras:',
    reset: 'Reiniciar'
  },
  it: {
    pieces: { pawn: 'Pedone', rook: 'Torre', knight: 'Cavallo', bishop: 'Alfiere', queen: 'Regina', king: 'Re' },
    colors: { white: 'Bianco', black: 'Nero' },
    events: { check: 'Scacco', checkmate: 'Scacco matto', promotion: 'Promozione' },
    turn: 'Turno',
    helpCommands: 'Comandi: help, board, captured, lang <code>, reset, exit, <mossa>',
    helpMoves: 'Mosse: e2e4; arrocco muovendo il re su g/c; promozione con e7e8=Q',
    capturedWhite: 'Catturati dal bianco:',
    capturedBlack: 'Catturati dal nero:',
    reset: 'Resetta'
  },
  zh_TW: {
    pieces: { pawn: '\u5175', rook: '\u8eca', knight: '\u99ac', bishop: '\u8c61', queen: '\u5a66', king: '\u738b' },
    colors: { white: '\u767d', black: '\u9ed1' },
    events: { check: '\u5c07\u8ecd', checkmate: '\u5c07\u6b7b', promotion: '\u6642\u5347' },
    turn: '\u8ab0\u7684\u56de合',
    helpCommands: '\u547d\u4ee4\uff1ahelp, board, captured, lang <code>, reset, exit, <\u79fb\u52d5>',
    helpMoves: '\u79fb\u52d5\uff1a e2e4\uff1b\u5927\u5f81\uff1a\u5c07\u738b\u79fb\u81f3 g/c\uff1b\u6642\u5347\uff1a e7e8=Q',
    capturedWhite: '\u767d\u65b9\u5403\u5b50\uff1a',
    capturedBlack: '\u9ed1\u65b9\u5403\u5b50\uff1a',
    reset: '\u91cd\u7f6e'
  },
  uk: {
    pieces: { pawn: '\u041f\u0456\u0448\u0430\u043a', rook: '\u0422\u0443\u0440\u0430', knight: '\u041a\u0456\u043d\u044c', bishop: '\u0421\u043b\u043e\u043d', queen: '\u0424\u0435\u0440\u0437\u044c', king: '\u041a\u043e\u0440\u043e\u043b\u044c' },
    colors: { white: '\u0411\u0456\u043b\u0456', black: '\u0427\u043e\u0440\u043d\u0456' },
    events: { check: '\u0428\u0430\u0445', checkmate: '\u0428\u0430\u0445 \u0456 \u043c\u0430\u0442', promotion: '\u041f\u0440\u043e\u043c\u043e\u0446\u0456\u044f' },
    turn: '\u0425\u0456\u0434',
    helpCommands: '\u041a\u043e\u043c\u0430\u043d\u0434\u0438: help, board, captured, lang <code>, reset, exit, <\u0445\u0456\u0434>',
    helpMoves: '\u0425\u043e\u0434\u0438: e2e4; \u0440\u043e\u043a\u0456\u0440\u043e\u0432\u043a\u0430 \u043a\u043e\u0440\u043e\u043b\u0435\u043c \u043d\u0430 g/c; \u043f\u0440\u043e\u043c\u043e\u0446\u0456\u044f e7e8=Q',
    capturedWhite: '\u0417\u0430\u0445\u043e\u043f\u043b\u0435\u043d\u043e \u0431\u0456\u043b\u0438\u043c\u0438:',
    capturedBlack: '\u0417\u0430\u0445\u043e\u043f\u043b\u0435\u043d\u043e \u0447\u043e\u0440\u043d\u0438\u043c\u0438:',
    reset: '\u0421\u043a\u0438\u043d\u0443\u0442\u0438'
  }
};
