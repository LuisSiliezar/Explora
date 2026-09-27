# Improvement: Android reminders that the user actually notices

Part 2 of the assessment: one concrete problem in the mobile experience, why it matters, the change, and reproducible before-and-after evidence.

## The problem
A reminder from "Remind me in 1 hour" (Detail → More) did fire on Android, but **only as a small icon in the status bar**. It showed no heads-up banner. You saw it only if you pulled down the notification shade.

This came up on 2026-09-27 while verifying S8 on the release APK ([test-scenarios.md → S8](test-scenarios.md)). The reminder was forced to fire with `adb shell cmd jobscheduler run -f`. The notification was posted ("Botanical Garden Walk / Starting soon at North Garden"), but it never appeared on screen.

**Cause:** notifee created the `reminders` channel without an `importance`, so Android gave it `IMPORTANCE_DEFAULT` (3). Only `IMPORTANCE_HIGH` (4) and above shows a heads-up banner.

## Why it matters
- The reminder is the app's native capability, and its whole job is to interrupt the user an hour later, when they're usually in another app. A reminder that has to be found in the shade has mostly failed at that job.
- Tests couldn't catch this: the notification *was* scheduled and posted, so `linking.test.ts` and the scheduling tests passed. It only showed up on a device.
- Android fixes a channel's importance **the first time the channel is created**. After that, the app can't raise it. Every install that had already created the channel would have stayed silent for good. So the fix was cheap now and gets more expensive once real users have installed the app.

## Before
Commit `f4f3442` (the parent of the fix).

- Behavior: the notification is posted as a status-bar icon only, with no banner (S8, Android row).
- Channel importance on the device: `mId='reminders' … mImportance=3` ([dumpsys capture](evidence/android/S8b-channels-dumpsys.txt)).

## The change
Commit `243ba6b` `fix(reminders): post reminders on a high-importance Android channel` (in [`notifee-notification.service.ts`](../src/infrastructure/services/notifee-notification.service.ts)):

- Reminders now post to a **new channel id**, `activity-reminders`, created with `AndroidImportance.HIGH`. The id had to change: `createChannel` on the existing `reminders` id can't change its importance.
- The old `reminders` channel is **not deleted**. Android drops notifications already scheduled on a deleted channel, so deleting it would silently cancel the reminders of users who upgrade.
- A unit test locks this in ([`notifee-notification.service.test.ts`](../__tests__/notifee-notification.service.test.ts)). It checks that reminders are scheduled on `activity-reminders` with `importance: HIGH` and still carry `data.activityId` for the tap-to-open flow.
- iOS needed no change: `foregroundPresentationOptions` already shows the banner ([iOS banner](evidence/ios/S8b-foreground-banner.png)).

## After
Same Pixel_10 emulator (`sdk_gphone16k_arm64`, Android 17, arm64), same scenario, 2026-09-27:

| Check | Before (`f4f3442`) | After (`243ba6b`) | Evidence |
|---|---|---|---|
| Channel importance (`dumpsys notification`) | `reminders`: **3** (DEFAULT) | `activity-reminders`: **4** (HIGH) | [dumpsys capture](evidence/android/S8b-channels-dumpsys.txt): both channels on one install |
| Where the reminder appears | status-bar icon only (observed) | heads-up banner, which importance 4 enables; not captured on screen (see Limitations) | [shade](evidence/android/S8b-notification-shade.png): the notification posted with its title and body |
| Tap with the app in background | – | opens Botanical Garden Walk detail | [background tap](evidence/android/S8b-tap-background.png) |
| Tap after `am kill` (cold start) | – | opens the same detail | [killed tap](evidence/android/S8b-tap-killed.png) |
| Unit test | – | `notifee-notification.service.test.ts` passes | `yarn test` |

The dumpsys capture comes from one device that ran both builds, so the old channel (3) and the new channel (4) appear side by side. This is also the upgrade case described above: existing installs keep a harmless unused channel, and new reminders go to the high-importance one.

## Reproduce it
You need an Android emulator or phone, and the delay stays at 1 hour: the reminder is fired early with jobscheduler.

1. Build the "before" state:
   ```bash
   git checkout f4f3442 && cd android && ./gradlew assembleDevRelease && cd ..
   ```
   Then uninstall any existing copy first, because channel importance survives upgrades:
   ```bash
   adb uninstall com.explora.dev; adb install android/app/build/outputs/apk/dev/release/app-dev-release.apk
   ```
2. Onboard, open any activity, tap **Remind me in 1 hour**, allow notifications, then press Home.
3. Fire the reminder now:
   ```bash
   adb shell dumpsys jobscheduler | grep -A12 com.explora.dev
   ```
   ```bash
   adb shell cmd jobscheduler run -f com.explora.dev <id from the JOB #u0a…/<id> line>
   ```
   Before: only a status-bar icon appears.
4. Read the channel's importance:
   ```bash
   adb shell dumpsys notification --noredact | grep -E "mId='(reminders|activity-reminders)'"
   ```
5. Repeat steps 1–4 on `develop` (or any commit from `243ba6b` on) with `adb install -r`, without uninstalling. Expected: a heads-up banner, and dumpsys lists both channels, 3 and 4. Tapping the notification opens the activity with the app in background and after `adb shell am kill com.explora.dev`.

## Limitations and open issues
- **No screenshot or video of the heads-up banner itself on Android.** It disappears after a few seconds and wasn't captured. The evidence is the channel importance (objective: HIGH is what enables heads-up on stock Android), the unit test, and the tap results. The presentation video should show the banner live.
- **Emulator only**, not a physical phone. OEM skins can treat heads-up notifications differently.
- **The user can still silence it.** If they lower the channel in system settings or turn on Do Not Disturb, Android respects that, and the app doesn't detect it or explain it.
- **Upgraded installs show two "Activity reminders" entries** in the app's notification settings, and the old one is unused. Deleting it safely would need a later release, once no reminders are left scheduled on it.
- **The 1 hour delay is fixed**, so checking this by hand needs the jobscheduler trick above (Android) or a temporary Debug-only change to `REMINDER_DELAY_MS` (iOS).
- iOS tapping the notification is still unverified (the simulator's injected touches trigger the swipe action). See [S8](test-scenarios.md).

## Also tried: list performance (not kept)
Before picking this problem, two list-performance fixes were measured on a release build with 1200 items. Neither improved on the baseline, and one made it much worse, so both were reverted. The numbers and the reasoning are in [performance.md → Improvement](performance.md#improvement-beforeafter). They're kept as evidence that the remaining jank is in GPU submission on the emulator, not in the app's JS, layout or image decoding.
