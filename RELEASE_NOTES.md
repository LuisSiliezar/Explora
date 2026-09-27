# Explora 1.0 (build 1): review build

**Commit:** `eb88adc` (merge of PR #2 into `main`, 2026-09-27) · **Built:** 2026-09-27 on macOS 26.6, Xcode 26.6 · **Environment:** dev (`com.explora.dev`). The dev environment keeps Settings → Developer → Simulated network, so reviewers can reproduce slow and failing loads ([README](README.md#reproducing-success-failure-slow-loading-and-reset)).

## Builds

| | Android | iOS |
|---|---|---|
| File | `Explora-dev-release.apk` | `Explora-dev-simulator.zip` (contains `Explora.app`) |
| Build | `./gradlew assembleDevRelease`: `dev` flavor, `release` build type, Hermes, New Architecture, not debuggable | `xcodebuild -scheme Explora-Dev -configuration Release -sdk iphonesimulator` |
| Runs on | Android 7.0+ (minSdk 24, targetSdk 36): emulator or phone | **iOS Simulator only**, iOS 26.0+ |
| Architectures | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` | `arm64`, `x86_64` (simulator slices) |
| App id | `com.explora.dev` (installs next to staging and prod) | `com.explora.dev` |
| Version | versionName `1.0`, versionCode `1` | `CFBundleShortVersionString` `1.0`, `CFBundleVersion` `1` |
| Signing | Android debug keystore, v2 signature, `CN=Android Debug` (see [Signing](#signing)) | unsigned (`CODE_SIGNING_ALLOWED=NO`) |
| Needs Metro | no: the JS bundle is inside the app | no |
| SHA-256 | `87affc0fc086f38a35d9d7166225d41721fbc58941dd84321c89a9618e3e3ea6` | `85a32d53d6991fee4d884ed3ec7b379c46d14e82a7a298dcc798a64d342e5e45` |

Build, package and hash (from the repo root):
```bash
cd android && ./gradlew assembleDevRelease && cd .. && mkdir -p build/handoff && cp android/app/build/outputs/apk/dev/release/app-dev-release.apk build/handoff/Explora-dev-release.apk
```
```bash
xcodebuild -workspace ios/Explora.xcworkspace -scheme Explora-Dev -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO build && (cd ios/build/Build/Products/Release-iphonesimulator && zip -qry ../../../../../build/handoff/Explora-dev-simulator.zip Explora.app)
```
```bash
shasum -a 256 build/handoff/*
```

`build/` is gitignored. The files are shared as downloads on the GitHub Release for the submission commit.

### Install
```bash
adb install -r Explora-dev-release.apk
```
```bash
unzip -o Explora-dev-simulator.zip && xcrun simctl install booted Explora.app && xcrun simctl launch booted com.explora.dev
```

## Changes since the 2026-09-24 handoff
- **Reminders show a heads-up banner on Android.** They now post to a HIGH-importance channel (`activity-reminders`). This is the Part 2 improvement: [docs/improvement.md](docs/improvement.md).
- **Logging.** Handled failures (offline fallback, corrupt storage, failed native calls) are logged through `LoggerPort`, at a level set per environment ([docs/logging.md](docs/logging.md)).
- **UI.** Empty and error states are centered above the floating tab bar. Rounder category pills.
- From the previous handoff: large-text fixes ([docs/accessibility.md](docs/accessibility.md)), and "Activity not found" for a deep link to an unknown id.

## Review builds vs store distribution
These are **review artifacts**, not a release.

| | These builds | A store release |
|---|---|---|
| Channel | a direct download for the review team | Google Play (AAB) and App Store / TestFlight (IPA) |
| Environment | `dev`, with reviewer tools (simulated network, perf seed off) | `prod` (`com.explora`): no developer menu; `isProduction` strips the simulation |
| Android | APK signed with the public debug key: anyone can re-sign it, so it isn't trusted as coming from us | AAB signed with a private upload key, re-signed by Play App Signing |
| iOS | unsigned simulator `.app`: can't be installed on an iPhone | device build signed with a distribution certificate and provisioning profile, through App Store review |
| Updates | reinstall by hand | store updates and staged/phased rollout |

A physical-device build (ad-hoc IPA or a release-signed APK) isn't provided: it needs a paid Apple Developer account and a private Android key, and neither is in scope.

## Signing
- **Android:** `release` uses `signingConfigs.debug` with `android/app/debug.keystore`. That's the standard React Native debug key, public and committed on purpose. It isn't a secret and must never sign a store build. For a store release: generate an upload keystore, keep it and its passwords out of the repo (CI secrets, or `~/.gradle/gradle.properties` locally), add a `release` signing config that reads them, and enroll in Play App Signing so a lost upload key can be reset.
- **iOS:** the simulator build is unsigned. A device or TestFlight build needs an Apple Developer team, a distribution certificate and an App Store provisioning profile. Use Xcode automatic signing, or `fastlane match` with an encrypted certificates repo in CI.
- No signing secrets, keystores other than the public debug one, certificates or profiles are in this repo.

## Versioning
- **User-facing version:** `versionName` / `MARKETING_VERSION`, semantic (`1.0` → `1.0.1` for a fix, `1.1` for features). Kept equal on both platforms.
- **Build number:** `versionCode` / `CURRENT_PROJECT_VERSION`. An integer raised on **every** uploaded build, even when the version stays the same, because stores reject a build number they've already seen.
- **Traceability:** each released build is tagged in git (`v1.0-build1`), and the release note names its commit and SHA-256.
- `package.json`'s `"version"` is `1.0.0` to match. The build doesn't read it, so bump it together with the native versions.
- The three environments are separate apps (`.dev`, `.staging`, none), so staging builds can go to testers without touching prod installs ([docs/environment.md](docs/environment.md)).

## Pre-release checks
Done for this build, before it's shared:
1. `yarn validate`: format check, typecheck, lint (warnings fail), knip, Jest.
2. CI on the PR ([docs/ci.md](docs/ci.md)): the same checks, `assembleDevRelease` plus the Maestro flows on an Android emulator, and an iOS simulator build.
3. Maestro flows 01–09 against the **release** APK: `yarn e2e`.
4. Manual scenarios S1–S8 on both platforms ([docs/test-scenarios.md](docs/test-scenarios.md)), and a perf capture at 1200 items ([docs/performance.md](docs/performance.md)).
5. Install the exact file whose hash is listed above on a clean simulator/emulator: launch, core journey, offline favorites, native feature (table below).

Added for a store release: build from a tag on `main` only, run a prod build through the same flows, send it to internal testers (Play internal track / TestFlight) for a few days, and check the crash-free rate before widening the rollout.

## If a release is faulty
1. **Stop the spread.** Review build: remove the download from the release and tell the reviewers. Store: halt the Play staged rollout, pause the App Store phased release.
2. **Assess.** Reproduce it, check whether user data is at risk, and decide between rolling back and a hotfix. Stores can't go back to a lower build number, so a "rollback" means shipping the last good commit again with a **higher** build number.
3. **Fix forward.** Branch from the release tag, fix it with a test that fails before the fix, run the pre-release checks again, and ship `1.0.1` with a new build number to the staged rollout.
4. **Protect local data.** Everything the user owns lives on the device (favorites, refresh-added activities). Storage keys are versioned (`favorites:v1`, `added-activities:v1`), a corrupt value is logged and ignored instead of crashing, and a release should never delete or rewrite old keys in the same version that introduces new ones. That's the difference between a bad release and lost user data.
5. **Follow up.** Write a short post-mortem, and add the missing check to CI.

**Gap:** logs only go to the device console (`ConsoleLogger`). Before a store release, crash and error reporting (Crashlytics or Sentry behind `LoggerPort`) is needed to detect a faulty release at all, not just to respond to one.

## Verification per platform
**On these exact files** (the hashes above), 2026-09-27, installed over the previous build (an upgrade, so existing favorites stayed in place):

| Check | Android: Pixel_10 emulator (`sdk_gphone16k_arm64`), Android 17 | iOS: iPhone 17 Pro simulator, iOS 26.0 |
|---|---|---|
| Launch without Metro | ✅ (no Metro running; Maestro drove the installed APK) | ✅ lands on Browse ([screenshot](docs/evidence/ios/R-artifact-launch.png)) |
| Core journey: onboarding, search → detail → back, favorite and remove (S1) | ✅ Maestro `01`, `02`, `03` | not re-run on this file: done by hand on the 2026-09-24 Release build (S1) |
| Refresh adds one, failure adds nothing, slow result in background applied once (S3, S4, S6) | ✅ Maestro `07`, `08`, `09` | not re-run on this file: done by hand on the 2026-09-24 build (S3, S4, S6) |
| Offline favorites (S2) | ✅ Maestro `04` (survives app kill), `05` (offline mid-session), `06` (cold start in airplane mode) | ⚠️ the favorite survived the upgrade install and a cold start ([screenshot](docs/evidence/ios/R-artifact-deeplink-favorite.png)); true offline can't be simulated: the simulator shares the Mac's network |
| Native feature: deep link, cold start (S8a) | ✅ `am start … act-001` opens its detail ([screenshot](docs/evidence/android/R-artifact-deeplink-cold.png)) | ✅ `simctl openurl … act-001` opens its detail ([screenshot](docs/evidence/ios/R-artifact-deeplink-favorite.png)) |
| Native feature: reminder (S8b) | not re-run on this file: HIGH channel, fire and tap verified earlier on 2026-09-27 ([improvement.md](docs/improvement.md)) | not re-run on this file: banner verified in a Debug build; tapping not verified |

**Maestro on the APK:** 9/9 flows passed in 6m 13s (Maestro 2.10.0, idle emulator). JUnit report: [R-maestro-report.xml](docs/evidence/android/R-maestro-report.xml).
**`yarn validate` on the commit:** pass: format, typecheck, lint, knip, 25 suites / 139 tests.
**CI on `eb88adc`:** failed in the Jest step. All 139 tests passed, but two test files left timers running (a looping skeleton animation, and TanStack Query garbage-collection timers), so Jest never exited and the runner ran out of memory. The fix changes only test files, so the app and these builds are unaffected. It's in the commit after `eb88adc`. The Android and iOS builds last passed in CI on `11650d7`. The Android Maestro job hasn't run on GitHub because of a billing block on the account, so on-device e2e was run locally (above).

## Known limitations
- **Simulator/emulator only:** no physical iPhone or Android phone was used.
- **Performance evidence is emulator-only:** ~17–18 ms frames at 1200 items, with the remaining misses in GPU submission ([docs/performance.md](docs/performance.md)).
- **Screen readers** were checked through the accessibility tree, not in a TalkBack/VoiceOver session by a person.
- **Search at the largest text size:** the results area is a narrow strip under the fixed filters. It's usable, and a layout change is proposed in [docs/accessibility.md](docs/accessibility.md).
- **The reminder delay is fixed at 1 hour.** Verification forces it early ([docs/native-features.md](docs/native-features.md)).
- **iOS e2e:** the Maestro iOS driver doesn't start on the build machine, so iOS was tested by hand.
