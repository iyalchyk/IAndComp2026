# MeAndComp

Browser remake of the classic Russian game "I and Computer 2.2" by Yuri Leushev / GiNeag. The project recreates the original atmosphere as a single-page game styled after Windows 98, built with a static pipeline and ES module-based logic.

![Status panel](screenshots/0001_status_panel.png)

## Current Features

- startup language selection: Russian and English;
- core gameplay panels: status, housing, shop, entertainment, hobby, education, job, bank, hardware, software, internet, and hacking;
- event-driven gameplay with an hourly game loop;
- mini-games and separate flows including fishing, casino games, and virus events;
- game data stored in JSON and text assets.

## Technology Stack

- HTML + Nunjucks partials;
- CSS split by panels;
- JavaScript ES modules;
- jQuery for DOM logic and data loading;
- [98.css](https://jdan.github.io/98.css/) for the Windows 98 visual style;
- Gulp + BrowserSync for builds and local development.

## Getting Started

Requires `Node.js` and `npm`.

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm start
```

Build for production:

```bash
npm run build
```

What these commands do:

- `npm start` clears `dist/`, rebuilds the project, starts a local BrowserSync server, and watches for changes in `src/**/*`;
- `npm run build` only rebuilds the static output into `dist/`.

## Important Limitation

The app should not be tested through `file://` because it relies on `fetch(...)`, `$.getJSON(...)`, and ES module loading. It must be served over HTTP, for example with `npm start`.

## Project Structure

```text
assets/
  data/          Game data, translations, and text resources
  images/        UI and gameplay images
src/
  html/          Pages and HTML partials
  css/           Main CSS and panel-specific styles
  js/            Entry point, global singletons, and panel modules
dist/            Generated static build
screenshots/     Current UI reference screenshots
gulpfile.js      Build pipeline
```

Key files:

- `src/html/pages/index.njk` - the only application page;
- `src/js/main.js` - entry point, data loading, UI initialization, and game loop startup;
- `src/js/global.js` - shared `World`, `Player`, and `Interface` singletons;
- `src/js/data.js` - loads `world.json` and prepares gameplay structures;
- `assets/data/world.json` - main gameplay configuration.

## Build Pipeline

The Gulp pipeline is intentionally simple:

1. deletes `dist/`;
2. renders `src/html/pages/*.+(html|njk)` through Nunjucks;
3. copies CSS into `dist/css`;
4. copies JavaScript into `dist/js`;
5. copies `assets/` into `dist/assets`.

There is no bundler, minification, tree-shaking, or asset fingerprinting. The browser receives files almost exactly as written.

## GitHub Pages Deployment

This repository includes a GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.

- every push to `master` triggers a production build;
- the workflow uploads `dist/` as the Pages artifact;
- deployment is performed through GitHub Actions Pages.

To enable it in GitHub:

1. open the repository settings;
2. go to `Pages`;
3. set the source to `GitHub Actions`.

## Development Notes

- The source of truth is `src/` and `assets/`. `dist/` is generated output.
- If you change a panel or its button, you will usually need coordinated edits in HTML, CSS, JS, and gameplay data.
- The original UI voice is Russian-first; preserve the existing tone unless a rewrite is intentional.
- Asset paths are kept relative so the app can be hosted from a GitHub Pages repository subpath such as `/MeAndComp/`.
- There is currently no automated test suite or linter, so manual browser verification is the main validation path.

## Manual Validation

After changes, the usual check is:

1. run `npm run build`;
2. run `npm start`;
3. verify the affected flow in the browser.

It is especially useful to re-check:

- navigation between panels and the Home button;
- timers and hourly updates;
- modal dialogs;
- requirement checks for jobs, internet, and hacking;
- asset loading and localization.

## Screenshots

![Internet panel](screenshots/1001_internet_initial_screen.png)

![Hacking panel](screenshots/1101_hacking_initial_screen.png)

## License

This project is distributed under the `ISC` license.
