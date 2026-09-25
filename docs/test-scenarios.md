# Test scenarios

Eight manual scenarios, each run on **both** platforms. Fill in **Actual** and **Evidence** after running them on the builds you hand in (not a dev server). Save screenshots or clips in `docs/evidence/android/` and `docs/evidence/ios/`, named `S<n>-<short-name>.png|mp4`.

**Build under test:** Android `Explora-dev-release.apk` (`assembleDevRelease`, release JS bundle, debug keystore; commit `3f278f4` + uncommitted work) · iOS `Explora.app` (`Explora-Dev` scheme, **Release** config, simulator; same commit). Both in `build/handoff/`, run 2026-09-24.
**Devices:** Android Pixel_10 emulator (Android 17, arm64) · iOS iPhone 17 Pro simulator (iOS 26.5). iOS was driven by hand through the Simulator app (the Maestro iOS driver doesn't start on this machine, see [testing.md](testing.md)).
**Result key:** ✅ pass · ❌ fail (link the issue) · ⚠️ pass with a note

Automated coverage for the same behavior is listed per scenario, so a reviewer can re-run it.

---

### S1. Search + category filter, and back from detail keeps both
**Steps:** Search tab → type `walk` → select the Outdoors category → open the first result → back.
**Expected:** Results match both the text and the category. After back, the query, category and scroll position are unchanged.
**Automated:** `filter-activities.test.ts`, `.maestro/02-browse-search.yaml`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | Maestro `02` on the handoff APK: search, open detail, back → query kept. (Flow uses `Botanical`, not `walk` + Outdoors.) | ✅ | `yarn e2e` run, 9/9 passed |
| iOS | `walk` + Outdoors → 2 results (Botanical Garden Walk, Sunset Walk), both Outdoors. Open the first → back: query, category and position unchanged. | ✅ | [results](evidence/ios/S1-search-walk-outdoors.png), [after back](evidence/ios/S1-after-back.png) |

### S2. Favorites survive a restart and work offline with full details
**Steps:** Favorite 2 activities → force-quit the app → turn on airplane mode → reopen → Favorites → open one.
**Expected:** Both favorites are listed; the detail shows title, description, location, duration and category offline, with the "saved offline" note.
**Automated:** `favorites.test.ts`, `.maestro/04-favorite-persists.yaml`, `06-offline-cold-start.yaml`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | Maestro `04` (favorite survives an app kill) and `06` (cold start in airplane mode: catalog, favorite and its detail with the offline note). | ✅ | `yarn e2e` run, 9/9 passed |
| iOS | Favorited 2 → force-quit (`simctl terminate`) → relaunch: both listed with "Saved on this device · available offline". Airplane mode can't be simulated: the simulator shares the Mac's network (Android covers it). | ⚠️ | [favorites after restart](evidence/ios/S2-favorites-after-restart.png) |

### S3. Refresh adds exactly one activity with a unique id
**Steps:** Settings → Data: note "Cached activities" (12) → Browse → pull to refresh → back to Settings → Data. Repeat twice.
**Expected:** A "New activity: …" toast each time; the count goes 12 → 13 → 14; each new item opens in detail; they are still there after a force-quit.
**Automated:** `refresh-activities.test.ts` (core behavior), `.maestro/07-refresh-adds-one.yaml`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | Maestro `07` on the handoff APK: 12 → 13 (Browse pull) → 14 (Search pull), still 14 after an app kill. Opening a new item in detail not re-checked on Android. | ✅ | `yarn e2e` run, 9/9 passed |
| iOS | 12 → pull on Browse (toast "New activity: Bread Baking Class") → pull again ("Birdwatching Morning") → force-quit → relaunch: 14. The new item opens in detail. | ✅ | [12](evidence/ios/S3-count-12.png), [toast](evidence/ios/S3-browse-pull-toast.png), [14 after quit](evidence/ios/S3-count-14-after-quit.png), [detail](evidence/ios/S3-new-item-detail.png) |

### S4. A failed refresh adds nothing and keeps everything else
**Steps:** Favorite one activity, type a search → Settings → Developer → **Failing** → Browse (badge visible) → pull to refresh.
**Expected:** Error toast "Couldn't refresh. Nothing was changed."; count unchanged; the list, favorite and search are untouched. Switch back to Normal → pull → one item added.
**Automated:** `refresh-activities.test.ts` (failure case), `offline-feedback.test.tsx`, `.maestro/08-refresh-fail-keeps-data.yaml`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | Maestro `08` on the handoff APK: count stays 12, favorite and search kept, badge shown. | ✅ | `yarn e2e` run, 9/9 passed |
| iOS | Failing: badge shown, toast "Couldn't refresh. Nothing was changed." on each pull; after 5 failed pulls the count stays 17, 3 favorites, search `Board` kept. Normal → pull → +1 is the S3 path. | ✅ | [video](evidence/ios/S4-failing-refresh.mp4), [count unchanged](evidence/ios/S4-count-unchanged.png) |

### S5. Loading, empty, error and retry states
**Steps:** (a) Developer → **Slow** → force-quit → reopen: the splash stays up until the catalog arrives (~4 s), then Browse. Type in Search: a skeleton shows while the query settles. (b) Developer → **Failing** → Settings → Data → Reset local data → Browse: error state with Retry → switch to Normal → Retry. (c) Search `zzzz`: empty state with "clear filters".
**Expected:** Each state is clear, announced by the screen reader, and Retry recovers without restarting.
**Automated:** `simulated-network.datasource.test.ts`, `App.test.tsx`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | (a) the splash covers the 4 s slow load ([screenshot](evidence/android/S5a-splash-during-slow-load.png)). The Browse skeleton isn't reachable by these steps (see the note below). (b) error state with Retry, recovers after Normal → Retry. (c) empty state with Clear filters. (b) and (c) ran as a Maestro flow. | ⚠️ | [error](evidence/android/S5b-error-retry.png), [after retry](evidence/android/S5b-after-retry.png), [empty](evidence/android/S5c-empty-state.png) |
| iOS | (a) same as Android; the search skeleton shows while typing (visible in the S6 run). (b) "Couldn't load activities" with Retry, Go to Favorites and `ERR_NETWORK · LAST SYNC Never`; Retry after Normal recovers without a restart. (c) "No activities match" + Clear filters. | ⚠️ | [error](evidence/ios/S5b-error-retry.png), [after retry](evidence/ios/S5b-after-retry.png), [empty](evidence/ios/S5c-empty-state.png) |


> **S5(a) note.** The original step ("reset → Browse: loading state for ~4 s") can't be observed: `useResetLocalData` resets the catalog query, which refetches immediately while you're still on the Data screen, and on a cold start `SplashScreen` waits for the catalog before it hides. The Browse skeleton only appears if you reach Browse within 4 s of a reset. The steps above test what a user can actually see.
### S6. A late refresh result during background/resume doesn't undo the user
**Steps:** Developer → **Slow** → Browse → pull to refresh → immediately search `Botanical` and favorite the first result → press Home → wait 5 s → reopen.
**Expected:** The new activity is added exactly once (count +1), the favorite is still saved, the search is still `Botanical`, no duplicate toast.
**Automated:** `refresh-activities.test.ts` ("late results"), `offline-feedback.test.tsx` ("after the screen is gone"), `.maestro/09-slow-refresh-background.yaml`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | Maestro `09` on the handoff APK: Slow, pull, search + favorite, Home 6 s, resume → count 13 (once), favorite and search kept. 17/17 on the dev build when run on an idle emulator (see testing.md). | ✅ | `yarn e2e` run, 9/9 passed |
| iOS | Slow → pull on Browse → Home while the spinner was on → 6 s → reopen: count 16 → 17 exactly once, landing after resume (last sync 17:53), 3 favorites kept. In an earlier run, a search (`Board`) and a favorite made while a refresh was in flight were intact after resume. | ✅ | [after resume](evidence/ios/S6-after-resume.png), [count once](evidence/ios/S6-count-once.png) |

### S7. Accessibility: screen reader, largest text, keyboard
**Steps:** Follow the manual check in [accessibility.md](accessibility.md) with VoiceOver/TalkBack on and the largest text size.
**Expected:** Every control reads a name, role and state; refresh results are announced; nothing is cut off without a way to read it; the keyboard's search key submits and scrolling dismisses it.
**Automated:** none, manual only. Toast announcements go through `useToast` (covered indirectly by `offline-feedback.test.tsx`).

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | **Largest text** (font 2.0 + display size max): found and fixed tab labels breaking mid-word, Settings titles truncated then breaking mid-word, "Clear all" pushed off screen, and "Last sync" colliding with its value. Still open: at this size the fixed Search header leaves a ~60 px strip for results under the tab bar (see accessibility.md). **Screen reader**: accessibility-tree dump (`uiautomator`) of every screen: every control has a name and role; the only unnamed node is the search pill, which is `accessible={false}` on purpose (its TextInput is labeled). Keyboard search key submits and dismisses. **Not** a real TalkBack session by a person. | ⚠️ | [accessibility.md](accessibility.md#results-2026-09-24) |
| iOS | **Largest text** (AX5): Browse, Search, Settings and Detail checked; found and fixed the search field clipping its text (placeholder invisible). Same open Search-layout issue as Android. **Screen reader**: controls checked in the host accessibility tree while driving the Simulator (labels such as "Add Botanical Garden Walk to favorites", "Clear search", "Back", tab names). **Not** a VoiceOver session by a person. | ⚠️ | [browse](evidence/ios/S7-max-text-browse.png), [search](evidence/ios/S7-max-text-search.png), [settings](evidence/ios/S7-max-text-settings.png), [detail](evidence/ios/S7-max-text-detail.png) |

### S8. Native feature: deep link and reminder notification
**Steps:** (a) With the app closed: `adb shell am start -a android.intent.action.VIEW -d "explora-dev://activity/act-001"` / `xcrun simctl openurl booted "explora-dev://activity/act-001"`, then the same with an unknown id. (b) Detail → "Remind me in 1 hour" → background the app → when it fires, tap the notification. The delay is fixed at 1 hour (`REMINDER_DELAY_MS`); there is no shorter option.
**Expected:** Both open the detail of the right activity; an unknown id shows the not-found state.
**Automated:** `linking.test.ts`

| Platform | Actual | Result | Evidence |
|---|---|---|---|
| Android | (a) Cold start via `am start … act-001` opens its detail. An unknown id first showed the network error ("The catalog didn't respond" + Retry); **fixed**: it now shows "Activity not found" with Back. (b) "Remind me in 1 hour" → toast "Reminder set — in 1 hour"; WorkManager job scheduled with ~60 min latency (`dumpsys jobscheduler`). The reminder is fixed at 1 h (`REMINDER_DELAY_MS`), so tapping the fired notification was **not** tested. | ⚠️ | [act-001](evidence/android/S8a-deeplink-act-001.png), [unknown](evidence/android/S8a-deeplink-unknown.png), [reminder](evidence/android/S8b-reminder-set.png) |
| iOS | (a) Cold start via `simctl openurl … act-001` opens its detail (iOS first asks "Open in Explora Dev?"); unknown id shows "Activity not found" + Back. (b) Reminder set after allowing notifications; the notification tap was not tested (same 1 h delay). | ⚠️ | [act-001](evidence/ios/S8a-deeplink-act-001.png), [unknown](evidence/ios/S8a-deeplink-unknown.png), [reminder](evidence/ios/S8b-reminder-set.png) |
