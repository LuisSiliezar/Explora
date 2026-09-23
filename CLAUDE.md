# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Deep docs live in [`docs/`](docs/README.md). Read the relevant doc before changing a layer.

## Git policy (non-negotiable)
- **Never commit.** Don't run `git commit`, `git push`, `git merge`, `git rebase`, `git stash`, `git reset`, `git tag` or `git commit --amend`, even if a task seems to call for it.
- Leave every change **uncommitted in the working tree**. The repo owner always reviews the diff and commits it themselves.
- Read-only git (`git status`, `git diff`, `git log`) is fine.
- At the end of every task, list the files that changed so the owner can review them.
- When suggesting a commit message, use Conventional Commits (`type(scope): summary`) with a scope from `commitlint.config.js`. The husky `commit-msg` hook rejects anything else.

## What this app is
**Explora** is a React Native (0.87, New Architecture) + TypeScript app. Users browse activities from a bundled JSON file (`src/assets/data/activities.json`), search and filter them, open a detail screen, and save favorites that work fully offline. A favorite can also get a reminder (notifications) and a photo (camera), and "Near me" sorts activities by distance (location). The UI follows the Claude Design prototype (splash → onboarding → Browse/Favorites/Settings) in English and Spanish. The list has to stay smooth with 1000+ items, and nothing the user changes can be lost when the app goes to background, the OS kills it, or the network is slow.

## Commands (Yarn only, never npm)
```bash
yarn                 # install JS deps
yarn pods            # install iOS pods (after adding/removing native deps)
yarn ios             # = ios:dev on the iPhone 17 Pro simulator
yarn ios:dev | ios:staging | ios:prod
yarn android         # = android:dev
yarn android:dev | android:staging | android:prod
yarn start           # Metro
yarn typecheck       # tsc --noEmit
yarn lint            # eslint, warnings fail
yarn knip            # unused files, exports and deps
yarn test            # jest
yarn e2e             # maestro flows in .maestro/ (dev app on a booted simulator/emulator)
yarn format          # prettier (format:check in CI)
yarn validate        # typecheck + lint + knip + test. Run before handing work back for review.
```

## Environments
There are three environments: dev, staging and prod. Each installs as a **separate app** (`com.explora.dev`, `com.explora.staging`, `com.explora`), and each has its own `.env.<env>` file read by react-native-config. On iOS the environment is chosen by the scheme (`Explora-Dev`/`-Staging`/`-Prod`); on Android by the flavor (`dev`/`staging`/`prod`). JS reads values only through `env` from `@config/env`. There are no secrets in env files, and env changes need a native rebuild. See [docs/environment.md](docs/environment.md).

## Architecture: Repository pattern, layered
```
presentation → core → domain ← infrastructure
                 ↑                  ↑
               config (adapters, env, DI composition root)
```
| Layer | Path | May import | Never imports |
|---|---|---|---|
| domain | `src/domain` | nothing (pure TS) | RN, libraries, other layers |
| core | `src/core` | domain, `config/adapters` *types* | infrastructure, presentation |
| infrastructure | `src/infrastructure` | domain, config | core, presentation |
| presentation | `src/presentation` | core, domain, `config/di` *types* | infrastructure (concrete classes) |
| config | `src/config` | everything (composition root) | — |

**Non-negotiable rules**
1. Concrete classes are created **only** in `src/config/di/container.ts`. Everywhere else depends on interfaces from `@domain/*`.
2. UI gets its dependencies with `useDependencies()`, never through direct imports of services or repositories.
3. Raw API or JSON shapes (DTOs) stay in `infrastructure/interfaces`. They are validated with zod and converted by a mapper, and only domain entities leave infrastructure.
4. Native modules (notifee, image-picker, geolocation, mmkv, haptic-feedback) are wrapped behind a port in `domain/services` or `config/adapters`, and nothing else imports them. UI-only libraries each have a single entry point: toasts via `hooks/useToast` (sonner-native), icons via `components/shared/Icon` (lucide-react-native), and BootSplash + Lottie only in `screens/splash`.
5. Server/async data goes through **TanStack Query** (`presentation/hooks`). Persisted UI state uses **zustand** (`core/store`). Favorites use `FavoritesRepository` with `useSyncExternalStore`. Don't mix these up. See [docs/state-management.md](docs/state-management.md).
6. Local-first: write to local storage first (synchronously), then call native or remote code.

## Principles (apply to every change)
- **SRP**: one reason to change per file. If a file maps and also fetches, split it.
- **OCP**: add behavior by adding a class or decorator (see `DevSeedActivityDataSource`), not by editing use-cases.
- **LSP**: every implementation must be usable in place of its interface. Tests prove this with fakes in `__tests__/helpers/fakes.ts`.
- **ISP**: keep ports small (`CameraPort`, `LocationPort`...). Don't create "god services".
- **DIP**: `domain` and `core` depend on abstractions, and `container.ts` wires in the concrete classes.
- **DRY**: shared UI goes in `components/shared`, query keys in `hooks/query-keys.ts`, and theme tokens in `presentation/theme`.
- **KISS**: plain functions and constructor injection. No DI framework, no base classes, and no abstraction without a second use.

## Conventions
- Files: `kebab-case.<type>.ts` (`activity.mapper.ts`, `get-activities.use-case.ts`, `favorites.repository.impl.ts`). Components and screens: `PascalCase.tsx`. Hooks: `useThing.ts`.
- Every folder has an `index.ts` barrel. Import through aliases: `@domain/…`, `@core/…`, `@infrastructure/…`, `@presentation/…`, `@config/…`, `@assets/…`, `@src/…`.
- Use-cases are functions of the form `(deps, ...args)`. Repositories and adapters are classes that `implements` an interface.
- Errors that cross layers are `DomainError` with a `code`. Don't throw raw strings or library errors past infrastructure.
- Styling: NativeWind `className` built on the theme tokens (`bg-background`, `text-text-muted`, `bg-primary`...). Use `useTheme()` only for props that can't take a class. No raw hex values: dark mode comes from the CSS variables. See [docs/ui-and-design-system.md](docs/ui-and-design-system.md).
- Text: always `components/shared/Text` (applies the fonts and the in-app text size). Copy: always `useT()` keys from `presentation/i18n/strings.ts`, in both `en` and `es`.
- Every pressable needs an `accessibilityRole` and `accessibilityLabel`.
- Lists: use `ActivityList` (FlashList). Row components are `memo` and receive stable callbacks.

## Adding a feature (checklist)
1. Entity or port in `domain/`
2. DTO + zod schema in `infrastructure/interfaces`, then a mapper
3. Datasource or service implementation
4. Repository interface (domain) and implementation (infrastructure)
5. Use-case in `core/use-cases`
6. Wire it in `config/di/container.ts` and add it to `Dependencies`
7. Hook in `presentation/hooks`, then the screen or component
8. Tests with fakes, then `yarn validate`, then update `docs/`

Full walkthrough: [docs/adding-a-feature.md](docs/adding-a-feature.md).

## Gotchas
- zod v4 needs `@babel/plugin-transform-export-namespace-from` (already in `babel.config.js`). Don't remove it.
- The TypeScript `paths` in `tsconfig.json` and the aliases in `babel.config.js` must match.
- After adding a native dependency, run `yarn pods`, rebuild, and add a mock to `jest.setup.js`.
- `pod install` needs a UTF-8 locale (the `yarn pods` script sets `LANG`).
- Env changes need a native rebuild. When you add a variable, update all 3 `.env.*` files, `.env.example`, `EnvSchema` and `react-native-config.d.ts`.
- Don't edit `ios/tmp.xcconfig` or `/tmp/envfile`; the scheme pre-action generates them. The iOS target's base config is `ios/Config/*.xcconfig`, which includes the Pods xcconfig, so keep both includes.
- `FavoritesRepository.getAll()` must return a stable reference, because `useSyncExternalStore` relies on it.
- `nativewind/babel` already registers the Reanimated/Worklets Babel plugin. Don't add `react-native-worklets/plugin` again.
- Colors live in `src/presentation/theme/palette.js` **and** `global.css`. Change both (a test compares them). After editing `metro.config.js`, `tailwind.config.js` or `global.css`, restart Metro with `yarn start --reset-cache`.
- Tailwind only sees literal class names: build dynamic classes from maps (`categoryTint`), not string interpolation of token names.
- Fonts in `src/assets/fonts` are linked with `npx react-native-asset`. Rerun it after adding a font, and use one font family per weight (Android).
- Jest uses `react-native-reanimated/jest/resolver` plus `setUpTests()` (see `jest.setup.js`). Don't mock Reanimated wholesale.
