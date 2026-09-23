# Native features

Every native SDK sits behind a **port** (domain interface). Swapping libraries means changing one class and the container.

| Feature | Port | Implementation | Library |
|---|---|---|---|
| Local notifications (reminders) | `NotificationPort` | `NotifeeNotificationService` | `@notifee/react-native` |
| Camera / photo library | `CameraPort` | `ImagePickerCameraService` | `react-native-image-picker` |
| Location | `LocationPort` | `GeolocationLocationService` | `@react-native-community/geolocation` |
| Persistence | `KeyValueStorage` | `MMKVStorageAdapter` | `react-native-mmkv` (v4, Nitro) |
| Connectivity | (config) | `setupQueryLifecycle`, `useIsOnline` | `@react-native-community/netinfo` |
| Haptics | `HapticsPort` | `HapticFeedbackService` | `react-native-haptic-feedback` |

UI-only libraries don't need a port, but each is reached from **one** place:

| Library | Used from | For |
|---|---|---|
| `react-native-bootsplash` | native launch screen + `screens/splash/SplashScreen` (`BootSplash.hide`) | native splash, handed off to the JS splash |
| `lottie-react-native` | `screens/splash/SplashScreen` (`assets/lottie/splash.json`) | the needle-spin logo, looped while the catalog loads |
| `sonner-native` | `hooks/useToast` + `<Toaster>` in `AppProviders` | toasts (with Undo) |
| `nativewind` | every component (`className`) | styling, see [ui-and-design-system.md](ui-and-design-system.md) |
| `react-native-reanimated` / `-worklets` / `-gesture-handler` / `-svg` | peers of NativeWind and sonner; Reanimated also drives the heart pop, skeleton and sheets | animation |

## Where they show up in the UI
- **Near me** (Browse chip, `useNearMe`): our pre-prompt dialog ("Allow while using app / Don't allow / Not now"), then the OS prompt, then a locating overlay while `useCurrentLocation` fetches the position. Activities are sorted with `sortByDistance` (haversine) and show a distance pill. Denied → a banner with **Open Settings**; everything else keeps working in alphabetical order. Settings → Location re-asks (or opens device settings) via `useLocationPermissionToggle` in `screens/settings/hooks`.
  > Activities carry optional `latitude`/`longitude` (still `schemaVersion: 1`; the fields are optional in the zod DTO). The bundled coordinates are fictional, placed around the iOS Simulator's default location (Apple Park) so the demo distances match the design.
- **Notifications** (Settings): pre-prompt, then `NotificationPort.requestPermission()`. The weekly-summary switch is a stored preference only; nothing schedules it yet.
- **Remind me in 1 hour** (Detail → More): `scheduleReminderUseCase` asks for permission, favorites the activity, cancels any previous reminder, schedules a timestamp trigger (carrying `data.activityId` and the localized `reminderBody`), and stores the `reminderId`. Unfavoriting cancels the reminder. Tapping the reminder opens the activity (see below) and `clearReminderUseCase` forgets the id, so the button reads "Remind me" again.
- **Add a photo** (Detail → More): choose Camera or Library. The URI is stored on the favorite, shown under More, and restored by Undo.
- **Haptics**: shared components fire a selection tick on press through `usePressHaptic` (buttons, chips, toggles, icon buttons, card taps, tabs). Outcome haptics (success on save, warning on blocked actions) stay in the hooks that know the result, so a press never ticks twice.

## Notifications & deep links
Deep links and reminder taps share one path: both turn into a URL that React Navigation resolves with `createLinking` (`presentation/routes/linking.ts`, passed to `NavigationContainer` in `AppProviders`).

Each environment has its own scheme (`APP_URL_SCHEME`), so side-by-side installs never steal each other's links:

| Env | Scheme |
|---|---|
| dev | `explora-dev://` |
| staging | `explora-staging://` |
| prod | `explora://` |

| Path | Opens |
|---|---|
| `activity/:id` | `ActivityDetail` (renders from the list cache or the favorite snapshot, so it works offline) |
| `browse`, `favorites`, `settings` | that tab |

Reminder tap flow:
- **App killed**: `getInitialURL` asks `Linking` first, then `NotificationPort.getInitialOpenedActivity()` (notifee `getInitialNotification`).
- **App alive**: `NotificationPort.onReminderOpened` fires on a notifee foreground `PRESS`, and also on returning to `active` with a notification intent (Android background taps). Ids are deduped, so a tap never navigates twice.
- **Foreground on iOS**: `foregroundPresentationOptions` shows the banner.
- **Background handler**: `index.js` calls `registerNotificationBackgroundHandler()` (a no-op `onBackgroundEvent`). notifee requires it on Android.

Native wiring: iOS `CFBundleURLTypes` (`$(APP_URL_SCHEME)`) + `RCTLinkingManager` in `AppDelegate.swift`. Android uses a VIEW/BROWSABLE intent filter on `MainActivity` with `${appUrlScheme}` from the flavor's `manifestPlaceholders`.

Links are ignored until onboarding is done, because the target screens aren't mounted yet.

Try it (after a native rebuild):
```bash
xcrun simctl openurl booted "explora-dev://activity/<id>"
adb shell am start -W -a android.intent.action.VIEW -d "explora-dev://activity/<id>" com.explora.dev
```

## Permissions
| Platform | Key | Why |
|---|---|---|
| iOS `Info.plist` | `NSCameraUsageDescription` | camera |
| | `NSPhotoLibraryUsageDescription` | library picker |
| | `NSLocationWhenInUseUsageDescription` | location |
| Android `AndroidManifest.xml` | `CAMERA` | camera |
| | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | location |
| | `POST_NOTIFICATIONS` | Android 13+ notifications (requested at runtime by notifee) |

Notifications need no Info.plist key on iOS, but permission is requested at runtime.

## Launch screen
`react-native-bootsplash` generated `ios/Explora/BootSplash.storyboard` (now the `UILaunchStoryboardName`), the Android `BootTheme`, and the logo assets in `src/assets/bootsplash/`. The source is `src/assets/bootsplash/logo.svg`. To change it:

```bash
npx react-native-bootsplash generate src/assets/bootsplash/logo.svg --platforms=android,ios --background=FFFFFF --logo-width=192 --assets-output=src/assets/bootsplash
```

The SVG keeps the Lottie's full 500×500 canvas, so the native logo sits exactly where frame 0 of `assets/lottie/splash.json` renders in the 192×192 `LottieView` (the generator caps Android at 192dp). If you change the Lottie, redraw the SVG from its shapes and regenerate. Dark-mode splash assets need a bootsplash license key, so the native splash is always white, and the JS splash uses `bg-white` to match.

## App icon
The source is `src/assets/images/app-icon.png` (the logo on a transparent background). All three environments share these generated files:
- **iOS**: `ios/Explora/Images.xcassets/AppIcon.appiconset/icon-*.png` (40–1024 px, opaque, logo centered at 70% on white).
- **Android**: `mipmap-*/ic_launcher.png` (square, white), `ic_launcher_round.png` (white circle), and the adaptive icon for API 26+: `mipmap-*/ic_launcher_foreground.png` (transparent, logo inside the 66/108 safe zone) + `mipmap-anydpi-v26/ic_launcher*.xml` with the `@color/ic_launcher_background` (white) background and a monochrome layer for themed icons.

To change it, regenerate every size from the new source with the same proportions, then rebuild both platforms. The icon is cached on the device's home screen, so uninstall the app first to see the change.

## Known caveats
- **Photo URIs** from the picker point to temporary or cache files. For long-term persistence, copy the file into the app's documents directory (for example with `react-native-fs` or `react-native-blob-util`) behind a `FileStoragePort`.
- **Android exact alarms**: notifee timestamp triggers can be delayed by Doze. If exact timing matters, use `alarmManager: { allowWhileIdle: true }` (and handle `SCHEDULE_EXACT_ALARM` on Android 12+).
- **iOS Simulator**: the camera isn't available (use Library). Set a simulated location in Features, then Location.
- When upgrading RN, recheck each library's New Architecture support. If one breaks, replace it behind its port.
