# Testing

Run `yarn test`, or `yarn validate` for typecheck, lint, knip and tests together. CI runs the same checks on every PR (see [ci.md](ci.md)).

## Strategy
| Level | What | Files |
|---|---|---|
| Unit: mappers | Validation and edge cases of raw data | `activity.mapper.test.ts` |
| Unit: use-cases | Business rules with fake ports | `favorites.test.ts`, `filter-activities.test.ts` |
| Unit: repositories | Contracts (`NOT_FOUND`, stable snapshot, persistence) | `activity.repository.test.ts`, `favorites.test.ts` |
| Render | The whole app mounts with a fake container; first launch → skip → guest lands on the tabs | `App.test.tsx` |
| E2E (not set up yet) | Real device flows | Maestro recommended |

## Fakes over mocks
`__tests__/helpers/fakes.ts` provides `InMemoryActivityDataSource`, `createFakeNotifications`, `createFakeCamera`, `createFakeLocation`, `createFakeHaptics`, `seedActivities`, and `createFakeContainer(overrides)`. Because every layer depends on interfaces, tests inject these directly without `jest.mock`. This is also the LSP check: if a fake can't stand in for the real class, the interface is wrong.

`jest.setup.js` mocks the **native modules** (mmkv, notifee, image-picker, geolocation, netinfo, config, haptic-feedback, bootsplash, lottie, sonner-native, safe-area-context) so that importing the real container never crashes under Jest.

Reanimated 4 is **not** mocked wholesale. `jest.config.js` uses `react-native-reanimated/jest/resolver` (it picks the JS implementations of Reanimated and Worklets), and `jest.setup.js` calls `setUpTests()`. `getUIRuntimeHolder` is stubbed because Gesture Handler v3 asks for the UI runtime on load. `global.css` is mapped to an empty module.

## Adding a native dependency
1. Add a mock to `jest.setup.js`.
2. If Jest fails with "unexpected token", add the package to `transformIgnorePatterns` in `jest.config.js`.
3. Add a fake for its port in `helpers/fakes.ts`.
