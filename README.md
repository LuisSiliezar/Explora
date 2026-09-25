# Explora

React Native (0.87, New Architecture) + TypeScript app for browsing activities, searching and filtering them, and saving favorites that work fully offline. Favorites can get reminders, photos and location; deep links open any activity.

## Run it
```bash
yarn && yarn pods
yarn ios        # dev app on the iPhone 17 Pro simulator
yarn android    # dev app on a booted emulator/device
```
Each environment (dev, staging, prod) installs as a separate app and reads its own `.env.<env>` file. See [docs/environment.md](docs/environment.md).

## Reviewer tools (dev and staging builds)
- **Simulated network:** Settings → Developer → Normal / Slow (4 s) / Failing. It applies to the catalog and to pull to refresh on the next request; a badge on Browse shows when it's on. Not present in production builds.
- **Pull to refresh** on Browse adds one random activity. Settings → Data & storage shows the catalog size and can reset all local data.
- **1200 items** for performance: set `DEV_SEED_MULTIPLIER=100` in `.env.staging` and rebuild (see [docs/performance.md](docs/performance.md)).
- **Deep link:** `explora-dev://activity/act-001`.

## Check it
```bash
yarn validate   # prettier check, typecheck, lint, knip, jest
yarn e2e        # Maestro flows in .maestro/ against the installed dev app
yarn perf:android
```

## Documentation
- [Decisions and evidence](docs/decisions-and-evidence.md): every requirement, where it's met, and its proof
- [Test scenarios](docs/test-scenarios.md), per platform
- [Offline and resilience](docs/offline-and-resilience.md), [Accessibility](docs/accessibility.md), [Performance](docs/performance.md)
- Architecture, conventions and how-tos: [`docs/`](docs/README.md)
- How AI was used: [AI_SESSION.md](AI_SESSION.md)
- Rules for AI assistants and contributors: [`CLAUDE.md`](CLAUDE.md)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): summary`). A husky `commit-msg` hook runs commitlint; allowed scopes are in [`commitlint.config.js`](commitlint.config.js).
