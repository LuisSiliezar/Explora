# Explora

React Native (0.87, New Architecture) + TypeScript app for browsing activities, searching and filtering them, and saving favorites that work fully offline. Favorites can get reminders, photos and location; deep links open any activity. The UI is in English and Spanish, and the list stays smooth with 1000+ items.

- [Verified platforms](#verified-platforms)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Run](#run)
- [Test](#test)
- [Reproducing success, failure, slow loading and reset](#reproducing-success-failure-slow-loading-and-reset)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Verified platforms

These are the exact environments the app was built, run and tested on. Anything not listed was not verified.

| | iOS | Android |
|---|---|---|
| **Device** | iPhone 17 Pro simulator | Pixel_10 emulator (arm64) |
| **OS** | iOS 26.5 (also opened on 26.0) | Android 17 |
| **Builds tested** | `Explora-Dev` scheme, Debug and **Release** (simulator) | `devDebug` and **`devRelease`** APK (release JS bundle, debug keystore) |
| **Manual scenarios** | S1–S8 by hand in the Simulator | S1–S8, most through Maestro |
| **E2E (Maestro)** | Not run: the Maestro iOS driver doesn't start on this host (see [testing.md](docs/testing.md)) | 9/9 flows pass on the release APK |
| **CI** | `xcodebuild` Debug simulator build (macOS runner) | `assembleDevRelease` + Maestro on an API 34 x86_64 emulator |
| **Last run** | 2026-09-27 | 2026-09-27 |

Host: macOS 26.6 (Apple Silicon), Xcode 26.6, Node 24.10 (CI uses Node 22), Yarn 1.22.22, Ruby 2.6.10, CocoaPods 1.16.2, OpenJDK 17.0.14, Maestro 2.10.0.

**Not verified:** physical iPhones or Android phones, iOS below 26, Android below 17 (except the CI emulator on API 34), a person-driven VoiceOver/TalkBack session, airplane mode on the iOS simulator (it shares the Mac's network), and tapping a reminder notification on iOS. Per-scenario results and screenshots are in [docs/test-scenarios.md](docs/test-scenarios.md).

---

## Prerequisites

Follow the React Native [environment setup](https://reactnative.dev/docs/set-up-your-environment) for your target platform first. Then check you have:

| Tool | Version | Check |
|---|---|---|
| Node | ≥ 22.11 | `node -v` |
| Yarn | 1.x (classic). Don't use npm. | `yarn -v` |
| Ruby + Bundler | ≥ 2.6.10 (iOS only) | `ruby -v` |
| Xcode | 26.x with an iOS 26 simulator runtime (iOS only) | `xcodebuild -version` |
| JDK | 17 (Android only) | `java -version` |
| Android SDK | compileSdk 37, build-tools 37.0.0, NDK 27.1.12297006, one AVD (Android only) | `emulator -list-avds` |
| Maestro | 2.10+ (E2E only) | `maestro --version` |

Install Maestro once with:

```bash
brew tap mobile-dev-inc/tap && brew install mobile-dev-inc/tap/maestro
```

---

## Setup

From a fresh clone:

**1. Create the env files.** The `.env.<env>` files are git-ignored, so a clone only has `.env.example`, whose values are the dev ones. Nothing in them is secret.

```bash
cp .env.example .env.development
```

That's all you need for `yarn ios` / `yarn android` (the dev app). For staging or prod builds, also create `.env.staging` and `.env.production` from the same template and change the values below (every variable is described in [docs/environment.md](docs/environment.md)):

| Variable | `.env.staging` | `.env.production` |
|---|---|---|
| `APP_ENV` | `staging` | `production` |
| `APP_DISPLAY_NAME` | `Explora Stg` | `Explora` |
| `APP_BUNDLE_ID` | `com.explora.staging` | `com.explora` |
| `APP_URL_SCHEME` | `explora-staging` | `explora` |
| `LOG_LEVEL` | `info` | `warn` |

**2. Install JS dependencies.**

```bash
yarn install --frozen-lockfile
```

**3. Install iOS pods** (macOS only; the script sets the UTF-8 locale CocoaPods needs).

```bash
bundle install
```

```bash
yarn pods
```

**4. Check that everything is in place.**

```bash
yarn validate
```

It should end with `Test Suites: 24 passed` and `Tests: 135 passed` (as of 2026-09-27).

---

## Run

Start Metro in one terminal, then build and launch in another. Env changes need a native rebuild, not just a Metro reload.

```bash
yarn start
```

```bash
yarn ios
```

```bash
yarn android
```

`yarn ios` builds the `Explora-Dev` scheme on the **iPhone 17 Pro** simulator; if your Xcode doesn't have it, run `npx react-native run-ios --scheme Explora-Dev --simulator "<name>"`. `yarn android` installs the `devDebug` variant on the booted emulator or connected device.

| Environment | iOS | Android | App id | Reviewer tools |
|---|---|---|---|---|
| dev | `yarn ios:dev` | `yarn android:dev` | `com.explora.dev` | Yes |
| staging | `yarn ios:staging` | `yarn android:staging` | `com.explora.staging` | Yes |
| prod | `yarn ios:prod` (Release) | `yarn android:prod` (Release) | `com.explora` | No |

Each environment installs as a separate app, so all three can sit side by side.

### Release builds for review

The manual scenarios were run on release builds (no Metro, no dev overlays). To build the same ones:

```bash
cd android && ./gradlew assembleDevRelease && cd ..
```

```bash
adb install -r android/app/build/outputs/apk/dev/release/app-dev-release.apk
```

```bash
xcodebuild -workspace ios/Explora.xcworkspace -scheme Explora-Dev -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO build
```

```bash
xcrun simctl install booted ios/build/Build/Products/Release-iphonesimulator/Explora.app
```

CI also publishes the devRelease APK and a Debug simulator `.app` as run artifacts (see [docs/ci.md](docs/ci.md)).

---

## Test

| Command | What it runs |
|---|---|
| `yarn validate` | Prettier check, typecheck, ESLint, knip, Jest. Run it before handing work back. |
| `yarn test` | Jest only (unit, hook and render tests with fakes, no device needed) |
| `yarn e2e` | Every Maestro flow in `.maestro/` against the installed **dev** app on a booted simulator/emulator |
| `yarn perf:android` | The 1000+ item scroll check (see [docs/performance.md](docs/performance.md)) |

Run one Jest file or one Maestro flow:

```bash
yarn test __tests__/refresh-activities.test.ts
```

```bash
maestro test .maestro/08-refresh-fail-keeps-data.yaml
```

E2E notes:

- Install and open the dev app first (`yarn android`, or the devRelease APK so Metro isn't needed). Each flow starts from a clean install state with permissions denied, so flows don't depend on each other.
- Run on an **idle** device: no Gradle build or second Maestro session at the same time. If a flow dies with "Device server died", it's Maestro/adb, not the app; re-run that flow.
- The offline flows (`05`, `06`) toggle airplane mode, which Maestro only supports on Android.
- On iOS the Maestro driver didn't start on the verification host (Xcode 26.6), so the iOS results are manual.

Details in [docs/testing.md](docs/testing.md).

---

## Reproducing success, failure, slow loading and reset

The catalog is bundled JSON, so there's no real server to break. Dev and staging builds put a **network simulator** in front of the catalog load and pull to refresh instead:

**Settings → Developer → Simulated network**

| Mode | Behavior |
|---|---|
| **Normal** | Requests succeed right away. |
| **Slow** | Every request waits **4 s**, then succeeds. |
| **Failing** | Every request waits ~0.6 s, then fails with a network error. |

- The mode is read on every request, so it applies to the next load or pull without a restart.
- It's **persisted**: it survives a force-quit, so a cold start reproduces slow or failing loads too. Set it back to **Normal** when you're done.
- While it's not Normal, Browse shows a "Simulated network: …" badge.
- It doesn't exist in production builds (the Developer row is hidden and the simulator isn't wired in).

To see the effect of a refresh, watch **Settings → Data & storage → Cached activities**. A fresh install shows **12**.

### Success

1. Developer → **Normal**.
2. Browse → pull down to refresh.
3. **Expected:** a toast "New activity: …", and Cached activities goes 12 → 13. Every pull adds exactly one activity with a unique id; it opens in detail and is still there after a force-quit.

Automated: `refresh-activities.test.ts`, `.maestro/07-refresh-adds-one.yaml`.

### Failure

**A failed refresh changes nothing:**

1. Favorite an activity and type a search.
2. Developer → **Failing** → back to Browse (the badge is visible).
3. Pull to refresh.
4. **Expected:** toast "Couldn't refresh. Nothing was changed."; Cached activities unchanged; the list, the favorite and the search are untouched.
5. Developer → **Normal** → pull again: one activity is added.

Automated: `offline-feedback.test.tsx`, `.maestro/08-refresh-fail-keeps-data.yaml`.

**A failed catalog load shows the error state, and Retry recovers:**

1. Developer → **Failing**.
2. Data & storage → **Reset local data** → **Reset everything** (this makes the catalog load again, now through the failing network).
3. Go to Browse.
4. **Expected:** "Couldn't load activities" with **Retry** and **Go to Favorites**, plus `ERR_NETWORK · LAST SYNC …`.
5. Developer → **Normal** → Browse → **Retry**: the catalog loads without restarting the app.

Automated: `simulated-network.datasource.test.ts`, `App.test.tsx`.

**Real offline (Android only):** turn on airplane mode, then use the app or cold-start it. The catalog, favorites and their details still work from the device, and refresh is refused with a toast instead of failing. Automated: `.maestro/05-offline-session.yaml`, `.maestro/06-offline-cold-start.yaml`.

### Slow loading

**Slow cold start:**

1. Developer → **Slow**.
2. Force-quit the app and open it again.
3. **Expected:** the splash stays up for about 4 s until the catalog arrives, then Browse opens with the full list.

**Slow refresh, including one that lands in background:**

1. Developer → **Slow** → Browse → pull to refresh.
2. While the spinner is still showing, search `Botanical` and favorite the first result.
3. Press Home, wait about 5 s, reopen the app.
4. **Expected:** the new activity is added **exactly once** (count +1), the favorite is still saved, the search is still `Botanical`, and there's no duplicate toast. On Android the result lands right after resume, because RN timers pause in background.

Automated: `refresh-activities.test.ts` ("late results"), `.maestro/09-slow-refresh-background.yaml`.

Typing in Search also shows a skeleton while the query settles. The Browse skeleton is hard to catch by hand, because the splash covers the first load (see the note under S5 in [test-scenarios.md](docs/test-scenarios.md)).

### Resetting local data

**In the app:** Settings → **Data & storage** → **Reset local data** → confirm **Reset everything**. A toast "Local data reset" confirms it.

| Cleared | Kept |
|---|---|
| All favorites, and their scheduled reminders are cancelled | Onboarding (it isn't shown again) |
| Every activity added by pull to refresh (back to 12) | Language, theme and text size |
| Search text and filters | The simulated network mode |
| | OS permissions (notifications, camera, location) |

The catalog then loads again right away (through the simulated network). Cancel (**Keep my data**) changes nothing. Automated: `favorites-undo-reset.test.ts`.

**Full wipe (fresh-install state, including onboarding and the network mode):**

```bash
adb shell pm clear com.explora.dev
```

```bash
xcrun simctl uninstall booted com.explora.dev
```

After the iOS uninstall, reinstall with `yarn ios` or `xcrun simctl install`. Maestro flows do the same with `launchApp: clearState: true`. For staging use `com.explora.staging`.

### Other reviewer tools

- **Deep link:** `xcrun simctl openurl booted "explora-dev://activity/act-001"` or `adb shell am start -a android.intent.action.VIEW -d "explora-dev://activity/act-001"`. An unknown id shows "Activity not found".
- **1200 items:** set `DEV_SEED_MULTIPLIER=100` in `.env.staging` and rebuild (see [docs/performance.md](docs/performance.md)).
- **Reminder notification:** Detail → "Remind me in 1 hour". How to fire it early is under S8 in [test-scenarios.md](docs/test-scenarios.md).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `pod install` fails with an encoding error | Use `yarn pods`, which sets `LANG=en_US.UTF-8`. |
| An env value didn't change | Env files are read at build time: rebuild the native app. |
| Styles or colors look stale after editing `global.css`, `tailwind.config.js` or `metro.config.js` | `yarn start --reset-cache` |
| Android text falls back to Roboto | Stale APK after a font change: `cd android && ./gradlew clean`, then `yarn android`. |
| iOS simulator "iPhone 17 Pro" not found | Pass another simulator name (see [Run](#run)). |
| A Maestro flow fails on "Device server died" | Stop other builds on the device, then re-run the flow. |
| Browse shows the error state on a normal network | The simulated network is probably still on **Failing** (look for the badge). |

---

## Documentation

- [Decisions and evidence](docs/decisions-and-evidence.md): every requirement, where it's met, and its proof
- [Test scenarios](docs/test-scenarios.md), per platform, with screenshots in [`docs/evidence/`](docs/evidence)
- [Offline and resilience](docs/offline-and-resilience.md), [Accessibility](docs/accessibility.md), [Performance](docs/performance.md)
- [Environments](docs/environment.md), [Testing](docs/testing.md), [CI](docs/ci.md)
- Architecture, conventions and how-tos: [`docs/`](docs/README.md)
- How AI was used: [AI_SESSION.md](AI_SESSION.md)
- Rules for AI assistants and contributors: [`CLAUDE.md`](CLAUDE.md)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): summary`). A husky `commit-msg` hook runs commitlint; allowed scopes are in [`commitlint.config.js`](commitlint.config.js).
