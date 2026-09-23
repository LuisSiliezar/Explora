# CI

GitHub Actions runs [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) on every pull request, on pushes to `main`, and on demand (`workflow_dispatch`). A newer push to the same branch cancels the run in progress. No secrets are needed.

## Jobs
| Job | Runner | What it does |
|---|---|---|
| `checks` | ubuntu | `yarn typecheck`, `yarn lint` (ESLint, warnings fail), `yarn format:check` (Prettier), `yarn knip`, `yarn test --ci` |
| `android` | ubuntu | Builds `assembleDevRelease` (signed with the debug keystore) and uploads the APK |
| `ios` | macOS | `yarn pods`, then builds the `Explora-Dev` scheme for the simulator without code signing and uploads `Explora.app` (zipped) |

The native jobs only start when `checks` passes. Both build the **dev** environment: `.env.*` files are gitignored, so CI copies `.env.example` (whose defaults are the dev values) to `.env.development`. If you add a variable, give it a working default in `.env.example`.

Build outputs appear under **Artifacts** on the run's summary page and are kept for 14 days. The simulator build installs with `xcrun simctl install booted Explora.app`. When the iOS build fails, the full `xcodebuild.log` is uploaded too.

## Run the same checks locally
```bash
yarn validate       # typecheck + lint + knip + test
yarn format:check   # yarn format fixes it
```

## Knip
[Knip](https://knip.dev) reports unused files, exports and dependencies. Config: [`knip.jsonc`](../knip.jsonc).
- Folder `index.ts` barrels are ignored as files, because every folder has one by convention.
- An export that is intentional public API but has no caller yet gets a `/** @public */` JSDoc tag (see `isProduction` in `src/config/env/env.ts`).
- A dependency that's never imported from JS (a toolchain preset, a native-only package) goes in `ignoreDependencies`, with a comment saying why.
- Otherwise, delete the dead code instead of silencing knip.
