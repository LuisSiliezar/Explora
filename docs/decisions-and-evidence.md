# Decisions and evidence

One page for the reviewer: what was decided, what it cost, what was left out, and what the results were. The linked docs hold the raw detail. This page gives the conclusions.

**Builds under test:** Android `devRelease` / `stagingRelease` APKs on a Pixel_10 emulator (Android 17, arm64); iOS `Explora-Dev` in the Release config on an iPhone 17 Pro simulator (iOS 26). Submission commit `eb88adc`. Hashes are in [RELEASE_NOTES.md](../RELEASE_NOTES.md#builds).

## Results at a glance

| Area | Result |
|---|---|
| Manual scenarios (S1–S8, both platforms) | **5 pass** (S1, S3, S4, S5, S6) and **3 pass with notes** (S2 on iOS, S7, S8). None fail. |
| Automated tests | Jest: 25 suites / 139 tests pass (`yarn validate`). Maestro: 9/9 flows pass on the submission APK. |
| Performance, 1200 items | Median **7.16% janky frames, 18 / 21 / 27 ms** frame time (p50 / p90 / p99), 6 slow UI-thread frames. The frame budget holds, and the remaining misses are GPU submission on the emulator. |
| Improvement | Android reminders went from a status-bar icon only (channel importance 3) to a heads-up banner (importance 4). |
| Native feature | Deep links open the right detail on a cold start on both platforms. The reminder fires and tapping it opens the detail on Android. On iOS the banner shows, but tapping it wasn't verified. |

## Architecture

The app uses a layered Repository pattern ([architecture.md](architecture.md), [ADR-001](decisions/001-repository-pattern.md)):

```
presentation → core → domain ← infrastructure
                 ↑                  ↑
               config (adapters, env, DI composition root)
```

- **domain** holds entities, repository and datasource interfaces, ports (`NotificationPort`, `CameraPort`, `LocationPort`…) and `DomainError`. It imports nothing.
- **core** holds use-cases (the rules, e.g. unfavoriting cancels the reminder) and persisted UI state (zustand).
- **infrastructure** holds DTOs validated with zod, mappers, datasources, repository implementations, and the native services behind the ports.
- **presentation** holds screens, components and hooks. It gets dependencies only through `useDependencies()`.
- **config/di/container.ts** is the only file that creates concrete classes. Tests swap in `createFakeContainer()`.

State has three homes, and they're never mixed: TanStack Query for async data, zustand for persisted UI state (filters, settings), and `FavoritesRepository` with `useSyncExternalStore` for favorites.

## Requirement → where it's met → proof

| Requirement | Where | Result | Proof |
|---|---|---|---|
| Browse, search by title, filter by category, combined; back keeps both | `useActivityFilter`, `core/store/activity-filter.store.ts` (persisted zustand) | ✅ both | `filter-activities.test.ts`, `.maestro/02`, [S1](test-scenarios.md) |
| Favorites on disk, survive restart, offline with full details | `StorageFavoritesRepository` (sync MMKV writes, full `Activity` snapshot) | ✅ Android, ⚠️ iOS (the simulator can't go offline, so airplane mode was only tested on Android) | `favorites.test.ts`, `.maestro/04`, `06`, [S2](test-scenarios.md) |
| Refresh adds one random activity with a unique id; failure adds nothing | `ActivityRepositoryImpl.refresh`, `MockActivityFeedDataSource`, `AddedActivitiesStorage` ([ADR-008](decisions/008-refresh-and-late-results.md)) | ✅ both (12 → 13 → 14, still 14 after a kill; 5 failed pulls leave the count unchanged) | `refresh-activities.test.ts`, `offline-feedback.test.tsx`, `.maestro/07`, `08`, [S3](test-scenarios.md), [S4](test-scenarios.md) |
| Loading, empty, error, retry | `ActivitiesContent`, `EmptyState`, `ErrorState` | ✅ both (Retry recovers without a restart) | `activities-content.test.tsx`, [S5](test-scenarios.md) |
| Reviewer can reproduce success, failure, slow | Settings → Developer → Simulated network (dev/staging only) | ✅ used for S4–S6 | `simulated-network.datasource.test.ts`, [S4–S6](test-scenarios.md) |
| Background/resume and late results don't undo the user | Read-time merge + mutation-level callbacks + separate stores ([ADR-008](decisions/008-refresh-and-late-results.md), [offline-and-resilience.md](offline-and-resilience.md)) | ✅ both (Slow → pull → Home 6 s → resume: added exactly once, search and favorites kept) | `refresh-activities.test.ts` ("late results"), `offline-feedback.test.tsx`, `.maestro/09`, [S6](test-scenarios.md) |
| Accessibility | [accessibility.md](accessibility.md), [ADR-007](decisions/007-large-text.md) | ⚠️ both (largest text fixed on every screen; screen readers checked via the accessibility tree, not by a person) | [S7](test-scenarios.md) |
| One native feature | Deep links + local notifications ([native-features.md](native-features.md)) | ⚠️ both (see [Native-feature verification](#native-feature-verification)) | `linking.test.ts`, `notifee-notification.service.test.ts`, [S8](test-scenarios.md) |
| 1000+ items, real release measurement | FlashList, `DevSeedActivityDataSource` ×100 = 1200 items | ✅ Android emulator (see [Performance](#performance)) | [performance.md](performance.md#results) |
| One improvement with before/after | Android reminders on a HIGH-importance channel (`243ba6b`) | ✅ (see [Improvement](#improvement-beforeafter)) | [improvement.md](improvement.md), [dumpsys before/after](evidence/android/S8b-channels-dumpsys.txt) |
| 2+ automated tests (core + failure) | Jest: `refresh-activities.test.ts` covers both, among 25 suites / 139 tests. Maestro flows 01–09 | ✅ | `yarn test`, `yarn e2e`, [JUnit report](evidence/android/R-maestro-report.xml) |

## Key decisions and their trade-offs

| # | Decision | Why | What it costs |
|---|---|---|---|
| 1 | **Repository pattern, layered** ([ADR-001](decisions/001-repository-pattern.md)) | The UI only sees interfaces, so tests use fakes (no `jest.mock` of our own code) and a real API can replace the JSON without touching screens. | More files per feature than calling the API from a hook. |
| 2 | **No `core/actions` layer** ([ADR-004](decisions/004-drop-core-actions.md)) | In the reference repo, actions and use-cases overlapped. Here repositories own data access, use-cases own rules and the container owns wiring, so each concern has one home. | The structure differs from the reference repo, so anyone who knows it needs to read architecture.md. |
| 3 | **MMKV with synchronous writes** ([ADR-002](decisions/002-mmkv-persistence.md)) | User changes are on disk before the UI updates, so an OS kill can't lose them. Favorites load with no flash at startup. | A native (Nitro) dependency, and the data isn't encrypted by default. |
| 4 | **FlashList** ([ADR-003](decisions/003-flashlist.md)) | Cell recycling keeps 1200 items smooth. One `ActivityList` serves Browse and Favorites. | Recycled cells can't hold item-bound local state. State must come from props or be keyed by id. |
| 5 | **Refresh is append-only and merged at read time** ([ADR-008](decisions/008-refresh-and-late-results.md)) | One synchronous write before resolving means a failure adds nothing by construction, and late responses can't drop or duplicate the new item. | Added items are device-local. "Reset local data" clears them. |
| 6 | **Network simulation as a decorator** (same pattern as `DevSeedActivityDataSource`) | No `if (dev)` inside use-cases or screens, and none of it is wired into production. | Only present in dev/staging builds, so prod can't reproduce failures on demand. |
| 7 | **Environments as separate apps** ([ADR-005](decisions/005-environments-as-separate-apps.md)) | Dev, staging and prod install side by side with separate storage and deep-link schemes. | iOS depends on a scheme pre-action (building without a scheme uses stale values), and each bundle ID needs its own signing. |
| 8 | **NativeWind v4 for styling** ([ADR-006](decisions/006-nativewind.md)) | Screens read like the design prototype, and dark mode comes from CSS variables with no raw hex values. | Adds Reanimated/Worklets, a Babel preset, a Metro wrapper and `global.css`. Class names must be literal strings. |
| 9 | **Large text up to 2×** ([ADR-007](decisions/007-large-text.md)) | Text keeps growing to the largest OS sizes (iOS AX5, Android 200%) instead of stopping at 140%. | Cards, chips and the tab bar must wrap rather than truncate. Above 2× the carousel would need a different layout. |

## Exclusions (deliberately not built)

- **No backend.** Refresh uses `MockActivityFeedDataSource`, and the catalog is bundled JSON. `RemoteActivityDataSource` exists and is picked when `API_URL` is set, but no environment sets it. So there's no server sync or conflict policy ([offline-and-resilience.md](offline-and-resilience.md#when-a-remote-api-exists)).
- **Camera/photo and "Near me" (location)** are built and wired behind `CameraPort` and `LocationPort`, but they weren't submitted as the native feature and have no manual scenario. The simulator has no camera (only the Library picker works there). Photo URIs point to temporary files and aren't copied into app storage.
- **Weekly summary notification:** the Settings switch is stored, but nothing schedules it.
- **Crash and error reporting:** logs go to the device console only (`ConsoleLogger` behind `LoggerPort`). Sentry or Crashlytics is needed before a store release.
- **Encrypted storage:** MMKV runs without an `encryptionKey`, because nothing sensitive is stored.
- **Exact alarms:** reminders use notifee timestamp triggers, which Android Doze can delay. `SCHEDULE_EXACT_ALARM` isn't requested.
- **Dark-mode native splash:** it needs a bootsplash license key, so the native splash is always white.
- **NativeWind v5:** ruled out because it requires `@expo/metro-config`.
- **Two list-performance fixes** were measured and reverted (see [Performance](#performance)).

## Improvement (before/after)

**Problem:** on Android, "Remind me in 1 hour" did fire, but only as a status-bar icon with no heads-up banner. The whole point of a reminder is to interrupt the user in another app, so this mostly failed. Tests couldn't catch it, because the notification was scheduled and posted correctly.

**Cause:** notifee created the `reminders` channel without an importance, so Android gave it `IMPORTANCE_DEFAULT` (3). Only HIGH (4) shows a banner. Android fixes a channel's importance when it's first created, so every existing install would have stayed silent for good. That made it cheap to fix now and expensive later.

**Change (`243ba6b`):** reminders post to a new channel, `activity-reminders`, with `AndroidImportance.HIGH`. The old channel isn't deleted, because Android drops notifications already scheduled on a deleted channel. A unit test locks in the channel, the importance and `data.activityId`. iOS needed no change.

| Check | Before (`f4f3442`) | After (`243ba6b`) |
|---|---|---|
| Channel importance (`dumpsys notification`) | `reminders`: **3** (DEFAULT) | `activity-reminders`: **4** (HIGH) |
| Where the reminder appears | status-bar icon only (observed) | heads-up banner, which importance 4 enables (not captured on screen) |
| Tap with the app in background | – | opens the activity detail |
| Tap after `am kill` (cold start) | – | opens the same detail |
| Unit test | – | `notifee-notification.service.test.ts` passes |

Evidence: [dumpsys capture](evidence/android/S8b-channels-dumpsys.txt) (both channels on one install), [notification shade](evidence/android/S8b-notification-shade.png), [background tap](evidence/android/S8b-tap-background.png), [killed tap](evidence/android/S8b-tap-killed.png). Steps to reproduce: [improvement.md](improvement.md#reproduce-it).

## Native-feature verification

Deep links and reminder taps share one path: both become a URL (`explora-dev://activity/<id>`, one scheme per environment) that React Navigation resolves.

| Check | Android | iOS |
|---|---|---|
| Deep link, cold start → activity detail | ✅ also re-checked on the submission build ([screenshot](evidence/android/R-artifact-deeplink-cold.png)) | ✅ also re-checked on the submission build ([screenshot](evidence/ios/R-artifact-deeplink-favorite.png)) |
| Deep link to an unknown id | ✅ "Activity not found" + Back (it used to show a network error; fixed) ([screenshot](evidence/android/S8a-deeplink-unknown.png)) | ✅ same ([screenshot](evidence/ios/S8a-deeplink-unknown.png)) |
| Reminder scheduled | ✅ toast + WorkManager job with ~60 min latency (`dumpsys jobscheduler`) ([screenshot](evidence/android/S8b-reminder-set.png)) | ✅ after allowing notifications ([screenshot](evidence/ios/S8b-reminder-set.png)) |
| Reminder fires | ✅ forced with `cmd jobscheduler run -f`, HIGH channel | ✅ banner in the foreground, lock screen / Notification Center in the background (Debug build with a 20 s delay) ([screenshot](evidence/ios/S8b-foreground-banner.png)) |
| Tap opens the activity | ✅ app in background and after `am kill` | ❌ **not verified**: the simulator's injected touches trigger the notification's swipe action instead of a tap |

## Performance

**Setup:** `stagingRelease` (Hermes, New Architecture, not debuggable), 1200 items (12 records ×100), the `.maestro/perf/1000-items.yaml` scroll scenario, `dumpsys gfxinfo`, Pixel_10 emulator on an Apple Silicon Mac. Techniques: FlashList v2, `memo` rows with stable callbacks, a per-row favorite subscription, lowercase search text precomputed in the mapper, a 250 ms search debounce. A Jest test checks that filtering 1200 items takes under 50 ms.

**Baseline (2026-09-24, median of 3 runs):** 6.99% janky frames, 18 / 21 / 21 / 22 ms (p50 / p90 / p95 / p99), 7 slow UI-thread frames, 0 bitmap uploads. Legacy janky (the app's own frame work) is under 0.4%. The misses are almost all "slow issue draw commands" (GPU submission through the emulator's host GPU layer).

**Re-check on the submission build (2026-09-27):** a first attempt measured about 3× worse on a busy host (load average 5–8). An A/B test alternated the baseline APK and the submission APK back to back:

| Pair | Host load | Baseline `f4f3442` janky | Submission janky |
|---|---|---|---|
| 1 | 9.0 / 7.0 | 21.01% | 20.20% |
| 2 | 4.7 / 5.8 | 7.23% | 7.02% |
| 3 | 6.4 / 4.8 | 7.83% | 7.16% |

Both builds move together with host load, so the first attempt measured the host, not a regression. The submission build's median is **7.16% janky, 18 / 21 / 27 ms, 6 slow UI-thread frames**, within the baseline's own spread (3.69–7.29%).

**Fixes tried and not kept:**

| | Janky (median of 3) | p50 / p90 / p99 (ms) | Verdict |
|---|---|---|---|
| Baseline | 6.99% | 18 / 21 / 22 | – |
| A: `fadeDuration={0}` + `resizeMethod="resize"` on the thumbnail | 6.83% | 17 / 21 / 23 | No measurable change. Bitmap uploads were already 0. Reverted. |
| B: round the `Image` instead of clipping its parent | 29.23% | 32 / 61 / 133 | Much worse. Reverted. |

Raw runs are in `perf/<timestamp>/`. Details: [performance.md](performance.md).

## Known limits

- **Simulator and emulator only.** No physical phone was used, and a low-end Android phone is still needed for a device performance verdict.
- **Performance numbers depend on host load.** Only the paired A/B comparison is reliable, and it's two quiet pairs.
- **Perf dataset:** 12 records repeated, so images and text lengths are friendlier than real data.
- **Not re-run on the submission builds:** S5, S7, S8b, and S6 on iOS. Their results come from the 2026-09-24 builds (S8b from 2026-09-27, before the final commit).
- **iOS notification tap not verified** (see [Native-feature verification](#native-feature-verification)). The Android heads-up banner itself wasn't captured on screen either. The evidence for it is the channel importance.
- **Screen readers** were checked through the accessibility tree, not in a TalkBack/VoiceOver session by a person.
- **Search at the largest text size** works, but results scroll in a ~60 px strip under the fixed filters. A layout change is proposed in [accessibility.md](accessibility.md).
- **iOS e2e** was done by hand, because the Maestro iOS driver doesn't start on the build machine. Toasts can't be asserted by Maestro on Android either. They're covered by unit tests.
- **The reminder delay is fixed at 1 hour.** Verification forces it early.
- **Added activities are device-local**, with no server sync.
