import { ChessCLI } from '../cli/core.js';

// reuse the engine created in app.js when available
const engine = window.engine;

window.chess = new ChessCLI();
if (engine) window.chess.engine = engine;
console.log('Chess CLI loaded. Use the `chess` object in the console.');
console.log('Type chess.help() for available commands.');