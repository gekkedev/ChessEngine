# ChessEngine

[**Play the demo**](https://gekkedev.github.io/ChessEngine/web)

This repository provides a small JavaScript chess engine that is intended to be
extended through a simple plugin system. A basic web interface is included in
the `web/` directory as an example of how the engine can be consumed.

## Structure

- `engine/` – standalone engine library that can be imported in browsers or
  other JavaScript environments.
- `web/` – minimal GUI built on top of the engine using vanilla JavaScript and
  HTML.
- `cli/` – command line interface for quick testing and interactive play.
- `test/` – Node.js test suite covering the engine and CLI.

## Usage

Open `web/index.html` in a modern browser to play. Moves are validated using the
standard chess rules implemented in the engine. Plugins can hook into the
`beforeMove` and `afterMove` events of the `ChessEngine` class to introduce new
rules or features.

### CLI

For quick testing on the command line a simple CLI is provided in `cli/`.
Install dependencies and run moves directly or interactively without touching JavaScript. Moves can
be written in lowercase or uppercase:

```bash
node cli/index.js --moves=e2e4,E7E5
node cli/index.js # start interactive mode
```

In interactive mode you can type `help` to show available commands and `board` to
display the full board at any time.

## GitHub Pages

The entire repository is automatically deployed to
[GitHub Pages](https://pages.github.com/). Any push to the `main` branch
publishes the demo at `https://gekkedev.github.io/ChessEngine/`. The entry
point is the `web/` directory, which loads the engine from the neighbouring
`engine/` folder.
All automated tests must pass before a new version is deployed.

## Extending

Create an object with hooks and register it via `engine.addPlugin(plugin)`.
Returning `false` from `beforeMove` prevents the move. You can add rules such as
castling variations, promotion behavior, custom pieces, or full game setups.

Plugin hooks supported by the engine:
- `setupBoard(engine) -> boolean`: Place an initial position and return `true` to skip the default setup.
- `beforeMove(engine, piece, move) -> boolean|void`: Return `false` to block.
- `onPromotion(engine, pawn, { x, y, choice }) -> false | { type } | { skip: true } | void`:
  - `false`: reject the move entirely
  - `{ type }`: replace pawn with a piece of that type
  - `{ skip: true }`: allow last-rank entry but keep the pawn (no promotion)
  - `void`: engine performs default promotion
- `afterMove(engine, piece, move)`: Observe successful moves.
- `translateEventName(engine, key) -> string|null`: Localize event names.
- `getDisplayName(engine) -> string`: Localized display name for UIs.

See `engine/plugins/revival.js` and `engine/plugins/aristocrats-vs-peasants.js` for examples.

### Game Mode: Aristocrats vs. Peasants
- One side (aristocrats) starts with the standard back rank only (no pawns).
- The other side (peasants) starts with two full pawn ranks and a king on the home square.
- Enable in the web demo via the checkbox labeled by the localized variant name (requires reset).
- Programmatic usage:
  - `import { AristocratsVsPeasantsPlugin } from './engine/plugins.js'`
  - `engine.addPlugin(new AristocratsVsPeasantsPlugin({ peasants: 'black' }))`
  - `engine.reset()` to apply the setup.

## Localization

Translations for piece names and basic events such as "check" and "checkmate"
are provided in `engine/locales.js`. Languages include English, German, French,
Spanish, Italian, Ukrainian and Traditional Chinese. The web interface
preselects the browser language and offers a drop-down selector.

## Testing

The project uses Node.js's built-in test runner. Ensure Node.js 18 or newer is
installed and run:

```bash
npm test
```

## License

See [LICENSE](LICENSE) for license information.
