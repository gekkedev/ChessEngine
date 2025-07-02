# ChessEngine

[**Play the demo**](web)

This repository provides a small JavaScript chess engine that is intended to be
extended through a simple plugin system. A basic web interface is included in
the `web/` directory as an example of how the engine can be consumed.

## Structure

- `engine/` – standalone engine library that can be imported in browsers or
  other JavaScript environments.
- `web/` – minimal GUI built on top of the engine using vanilla JavaScript and
  HTML.

## Usage

Open `web/index.html` in a modern browser to play. Moves are validated using the
standard chess rules implemented in the engine. Plugins can hook into the
`beforeMove` and `afterMove` events of the `ChessEngine` class to introduce new
rules or features.

### CLI

For quick testing on the command line a simple CLI is provided in `cli/`.
Install dependencies and run moves directly without touching JavaScript. Moves can
be written in lowercase or uppercase:

```bash
node cli/bin/chessengine.js --moves=e2e4,E7E5
```

## GitHub Pages

The entire repository is automatically deployed to
[GitHub Pages](https://pages.github.com/). Any push to the `main` branch
publishes the demo at `https://gekkedev.github.io/ChessEngine/`. The entry
point is the `web/` directory, which loads the engine from the neighbouring
`engine/` folder.

## Extending

Create an object with `beforeMove(engine, piece, move)` or `afterMove(engine,
piece, move)` methods and register it using `engine.addPlugin(plugin)`. Returning
`false` from `beforeMove` prevents the move from being made. This mechanism
allows rules such as castling, en passant or custom pieces to be added without
modifying the core engine.

## Localization

Translations for piece names and basic events such as "check" and "checkmate"
are provided in `engine/locales.js`. Languages include English, German, French,
Spanish, Italian, Ukrainian and Traditional Chinese. The web interface selects a
language based on the browser settings.

## Testing

The project uses Node.js's built-in test runner. Ensure Node.js 18 or newer is
installed and run:

```bash
npm test
```

## License

See [LICENSE](LICENSE) for license information.
