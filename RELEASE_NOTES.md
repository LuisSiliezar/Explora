# Explora 1.0.0 (handoff build)

**Date:** 2026-09-24 · **Commit:** `3f278f4` plus the uncommitted work on `develop` (rebuild after committing for an exact match)
**Environment:** dev (`com.explora.dev`): includes Settings → Developer (simulated network) for reviewers.

## Builds
Local builds, not uploaded anywhere. They sit in `build/handoff/` (gitignored):

| File | What | SHA-256 |
|---|---|---|
| `Explora-dev-release.apk` | Android `assembleDevRelease`: release JS bundle (Hermes), signed with the debug keystore | `b98475047a6ce59c26ed847fbea177dc4381703cddcc1b8941ea3ce3b4d7a23b` |
| `Explora-dev-simulator.zip` | iOS `Explora.app`, `Explora-Dev` scheme, **Release** configuration, for the simulator (no Metro needed) | `81a9e481d55231f970e440fe9e8d43deedac187e0b10f42140facd62bc154ffd` |

### Install
```bash
adb install -r build/handoff/Explora-dev-release.apk
```
```bash
unzip -o build/handoff/Explora-dev-simulator.zip -d build/handoff && xcrun simctl install booted build/handoff/Explora.app
```

## What's in it
- Browse (category carousels), Search with category and duration filters, activity detail, Favorites that work fully offline, Settings (language en/es, text size, dark mode, location, data & storage).
- Pull to refresh on Browse and Search adds exactly one new activity. A failed refresh changes nothing; a slow one that finishes in the background is applied once.
- Native features: reminder notification (1 hour), photo on a favorite, "Near me" distance sort, deep links `explora-dev://activity/<id>`.
- Offline: bundled catalog, cached last catalog, offline banners, favorites with a saved snapshot.

## Changes in this handoff
- Accessibility at the largest text sizes: the tab bar, Settings rows, search results header, Data & storage rows and the iOS search field no longer clip or break words (see [docs/accessibility.md](docs/accessibility.md#results-2026-09-24)).
- A deep link to an unknown activity now shows "Activity not found" with Back, instead of a network error with a useless Retry.

## Verified
- `yarn validate` green (format, typecheck, lint, knip, 124 tests).
- Android: all 9 Maestro flows pass on this APK (Pixel_10 emulator, Android 17).
- Scenarios S1–S8 on both platforms: results and evidence in [docs/test-scenarios.md](docs/test-scenarios.md).
- Performance at 1200 items: [docs/performance.md](docs/performance.md#results).

## Known limitations
- **Search at the largest text size:** results scroll in a small strip under the fixed filters. Usable, but a layout change is proposed in accessibility.md.
- **Screen readers:** checked through the accessibility tree only, not in a real TalkBack/VoiceOver session.
- **Reminder:** fixed at 1 hour; tapping the fired notification wasn't tested in this round.
- **Performance evidence is emulator-only**, with no real low-end phone. On the emulator the list holds ~17–18 ms frames with ~7% janky frames, all in GPU submission. Two candidate fixes didn't help and weren't kept.
- **iOS e2e:** the Maestro iOS driver doesn't start on the build machine; iOS was tested by hand.
- Offline scenarios (airplane mode) can only be run on Android; the iOS simulator shares the Mac's network.
