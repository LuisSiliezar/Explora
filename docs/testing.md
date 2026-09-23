# Testing

Run `yarn test`, or `yarn validate` for typecheck, lint, knip and tests together. CI runs the same checks on every PR (see [ci.md](ci.md)).

## Strategy
| Level | What | Files |
|---|---|---|
| Unit: mappers | Validation and edge cases of raw data | `activity.mapper.test.ts` |
| Unit: use-cases | Business rules with fake ports | `favorites.test.ts`, `filter-activities.test.ts` |
| Unit: repositories | Contracts (`NOT_FOUND`, stable snapshot, persistence) | `activity.repository.test.ts`, `favorites.test.ts` |
| Render | The whole app mounts with a fake container; first launch → skip → guest lands on the tabs | `App.test.tsx` |
| E2E | Real app on a simulator/emulator: onboarding, search → detail, favorite/unfavorite, favorite survives an app kill | `.maestro/*.yaml` |

## E2E with Maestro
[Maestro](https://maestro.mobile.dev) drives the installed **dev** app (`com.explora.dev` on both platforms) from YAML flows in `.maestro/`.

```bash
brew tap mobile-dev-inc/tap && brew install mobile-dev-inc/tap/maestro   # once (needs Java 17+)
yarn ios            # or yarn android: the dev app must be installed and running on a booted device
yarn e2e            # runs every top-level flow in .maestro/
maestro test .maestro/03-favorite.yaml   # one flow
yarn e2e:studio     # inspector to find selectors and try commands
```

- Every flow starts from a clean install (`launchApp: clearState`) with permissions denied, so flows don't depend on each other or on system dialogs. Shared steps live in `.maestro/subflows/` (not run on their own).
- Select elements by `testID`, not by copy: text changes with the language (en/es). Naming: kebab-case `screen-element`, with the entity id for rows (`activity-card-act-001`, `favorite-act-001`, `tab-favorites`, `detail-back`). Add a `testID` next to the `accessibilityLabel` when a flow needs a new element; shared components (`FavoriteButton`, `IconButton`) forward an optional `testID` prop.
- Flows use `act-001` from `activities.json` via search, so they don't depend on list order or sorting.
- CI runs the suite on an Android emulator against the devRelease APK (`android-e2e` job in [ci.md](ci.md)).

## Fakes over mocks
`__tests__/helpers/fakes.ts` provides `InMemoryActivityDataSource`, `createFakeNotifications`, `createFakeCamera`, `createFakeLocation`, `createFakeHaptics`, `seedActivities`, and `createFakeContainer(overrides)`. Because every layer depends on interfaces, tests inject these directly without `jest.mock`. This is also the LSP check: if a fake can't stand in for the real class, the interface is wrong.

`jest.setup.js` mocks the **native modules** (mmkv, notifee, image-picker, geolocation, netinfo, config, haptic-feedback, bootsplash, lottie, sonner-native, safe-area-context) so that importing the real container never crashes under Jest.

Reanimated 4 is **not** mocked wholesale. `jest.config.js` uses `react-native-reanimated/jest/resolver` (it picks the JS implementations of Reanimated and Worklets), and `jest.setup.js` calls `setUpTests()`. `getUIRuntimeHolder` is stubbed because Gesture Handler v3 asks for the UI runtime on load. `global.css` is mapped to an empty module.

## Adding a native dependency
1. Add a mock to `jest.setup.js`.
2. If Jest fails with "unexpected token", add the package to `transformIgnorePatterns` in `jest.config.js`.
3. Add a fake for its port in `helpers/fakes.ts`.
