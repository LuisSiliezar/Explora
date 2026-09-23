# Explora

React Native + TypeScript app for browsing activities, searching and filtering them, and saving favorites that work offline. Favorites can get reminders, photos and location.

```bash
cp .env.example .env
yarn && yarn pods
yarn ios        # or: yarn android
yarn validate   # format:check + typecheck + lint + knip + tests
```

- Architecture, conventions and how-tos: [`docs/`](docs/README.md)
- Rules for AI assistants and contributors: [`CLAUDE.md`](CLAUDE.md)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): summary`). A husky `commit-msg` hook runs commitlint; allowed scopes are in [`commitlint.config.js`](commitlint.config.js).
