# Testing

Run `yarn test`, or `yarn validate` for the Prettier check, typecheck, lint, knip and tests together. CI runs the same checks on every PR (see [ci.md](ci.md)).

## Strategy

| Level                    | What                                                                                                                                           | Files                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Unit: mappers            | Validation and edge cases of raw data                                                                                                          | `activity.mapper.test.ts`                          |
| Unit: use-cases          | Business rules with fake ports                                                                                                                 | `favorites.test.ts`, `filter-activities.test.ts`   |
| Unit: repositories       | Contracts (`NOT_FOUND`, stable snapshot, persistence)                                                                                          | `activity.repository.test.ts`, `favorites.test.ts` |
| Unit: refresh            | Adds exactly one activity with a unique id, persists across a restart, a failure/abort adds nothing, late catalog reads still include the item | `refresh-activities.test.ts`                       |
| Unit: network simulation | Slow delays, fail throws `NETWORK`, abort stops waiting, mode read per request                                                                 | `simulated-network.datasource.test.ts`             |
| Hook: refresh            | Offline refusal, one item + toast, failure keeps the list, double pull adds once, a result after unmount is applied once                       | `offline-feedback.test.tsx`                        |
| Render                   | The whole app mounts with a fake container; first launch → skip → guest lands on the tabs                                                      | `App.test.tsx`                                     |
| E2E                      | Real app on a simulator/emulator: onboarding, search → detail, favorite/unfavorite, favorite survives an app kill, offline mode (Android)      | `.maestro/*.yaml`                                  |

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
- **Offline flows** (`05-offline-session`, `06-offline-cold-start`, tag `offline`) toggle airplane mode with `setAirplaneMode`, which Maestro supports **only on Android**. On iOS they're skipped (a `when: platform: Android` guard), because the simulator shares the Mac's network. Each restores the network in `onFlowComplete`, so a failure never leaves the emulator offline. Run only them with `maestro test --include-tags offline .maestro`.
  - Toasts (sonner-native) aren't in the Android accessibility tree, so the connectivity and "can't refresh" toasts are unit-tested in `offline-feedback.test.tsx` instead.
  - When the app **process starts offline**, RN Android leaves the offline banners' `testID`s out of the accessibility tree (the nodes and text are there). `06` matches them by English text; `05` (going offline mid-session) uses the ids.
  - In debug builds the emulator reaches Metro over the network (`10.0.2.2`), so airplane mode shows RN's "Fast Refresh disconnected" banner. The matching "Cannot connect to Metro" warning is in `LogBox.ignoreLogs` (`App.tsx`), otherwise its LogBox bar covers the tab bar and swallows taps.
- **Refresh flows** (`07-refresh-adds-one`, `08-refresh-fail-keeps-data`, `09-slow-refresh-background`) use the Developer network toggle (`subflows/set-network.yaml`) and read the catalog size from Settings → Data (`data-cached-count`, via `subflows/assert-catalog-count.yaml`), because the generated title is random and toasts can't be asserted.
  - `09` backgrounds the app while a 4 s simulated refresh is in flight. Android pauses RN timers in background, so the response lands right after resume (still a late result). Maestro has no sleep, so the flow waits with an `optional` `extendedWaitUntil` on an id that never exists.
  - Right after that resume the JS thread is busy, and a tap during the Settings push transition can be dropped; `subflows/assert-catalog-count.yaml` taps back a second time only if it's still on the Data screen.
- **Run flows on an idle device.** Don't build, install or run another Maestro session on the same emulator while a flow runs. Earlier failures of `01`, `06` and `09` all happened while a Gradle build ran next to them. Re-run alone on 2026-09-24 (Pixel_10 emulator, Android 17, dev debug, Maestro 2.10): `01` 3/3, `06` 3/3, `09` 17/17 where the flow actually ran. The other 3 of 20 `09` runs never reached a step: Maestro's own device server died ("Device server died" / "driver did not start up in time"). That's a Maestro/adb failure, not the app; re-run the flow. Force-stopping `dev.mobile.maestro` before a run avoids it.
- **iOS:** on this machine (Xcode 26.6, Maestro 2.10) the Maestro iOS driver fails to start on both iOS 26.0 and 26.5 simulators ("Timed out waiting for AX loaded notification"), so the flows were run on Android. The iOS behavior was checked by hand; see [test-scenarios.md](test-scenarios.md).
- CI runs the suite on an Android emulator against the devRelease APK (`android-e2e` job in [ci.md](ci.md)).

## Fakes over mocks

`__tests__/helpers/fakes.ts` provides `InMemoryActivityDataSource`, `FailingActivityFeedDataSource`, `createActivityRepository({ dataSource, feed, storage })`, `deferred()` (a promise the test resolves later, for late-result cases), `createFakeNotifications`, `createFakeCamera`, `createFakeLocation`, `createFakeHaptics`, `seedActivities`, and `createFakeContainer(overrides)`. Because every layer depends on interfaces, tests inject these directly without `jest.mock`. This is also the LSP check: if a fake can't stand in for the real class, the interface is wrong.

`jest.setup.js` mocks the **native modules** (mmkv, notifee, image-picker, geolocation, netinfo, config, haptic-feedback, bootsplash, lottie, sonner-native, safe-area-context) so that importing the real container never crashes under Jest.

Reanimated 4 is **not** mocked wholesale. `jest.config.js` uses `react-native-reanimated/jest/resolver` (it picks the JS implementations of Reanimated and Worklets), and `jest.setup.js` calls `setUpTests()`. `getUIRuntimeHolder` is stubbed because Gesture Handler v3 asks for the UI runtime on load. `global.css` is mapped to an empty module.

## Adding a native dependency

1. Add a mock to `jest.setup.js`.
2. If Jest fails with "unexpected token", add the package to `transformIgnorePatterns` in `jest.config.js`.
3. Add a fake for its port in `helpers/fakes.ts`.
