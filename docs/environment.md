# Environments

Explora has **three environments**. Each one installs as its **own app** (separate bundle ID, display name and data), so dev, staging and prod can sit side by side on one device.

| Env | Env file | iOS scheme | Android flavor | Bundle / application ID | Home-screen name |
|---|---|---|---|---|---|
| development | `.env.development` | `Explora-Dev` | `dev` | `com.explora.dev` | Explora Dev |
| staging | `.env.staging` | `Explora-Staging` | `staging` | `com.explora.staging` | Explora Stg |
| production | `.env.production` | `Explora-Prod` (Release) | `prod` | `com.explora` | Explora |

## Run
```bash
yarn ios:dev        # = yarn ios   (iPhone 17 Pro simulator)
yarn ios:staging
yarn ios:prod       # Release build
yarn android:dev    # = yarn android
yarn android:staging
yarn android:prod   # prodRelease
```
From Xcode, pick the scheme (Explora-Dev, Explora-Staging or Explora-Prod). From Android Studio, pick the Build Variant (`devDebug`, `stagingDebug`, …).

## Variables
| Var | Used by | Meaning |
|---|---|---|
| `APP_ENV` | JS (`env.APP_ENV`, `isProduction`) | `development` \| `staging` \| `production` |
| `APP_DISPLAY_NAME` | iOS Info.plist `CFBundleDisplayName`, JS | Home-screen name (Android takes it from the flavor's `resValue`) |
| `APP_URL_SCHEME` | iOS Info.plist `CFBundleURLSchemes`, JS (`linking` prefix) | Deep-link scheme: `explora-dev`, `explora-staging`, `explora`. Android can't read it in the manifest, so each flavor repeats it in `manifestPlaceholders.appUrlScheme` (`android/app/build.gradle`). Keep them in sync. |
| `APP_BUNDLE_ID` | iOS `PRODUCT_BUNDLE_IDENTIFIER` | Bundle ID (Android uses `applicationIdSuffix`) |
| `API_URL` | JS container | Remote activities API. Leave empty to use the bundled JSON. |
| `API_TIMEOUT_MS` | `AxiosAdapter` | HTTP timeout |
| `DEV_SEED_MULTIPLIER` | container, `__DEV__` only | Multiplies the seed data (100 → 1200 items) for perf testing |

JS reads values **only** through `env` in `src/config/env/env.ts`, which validates them with zod when the app starts.

## How it's wired
**iOS**
1. Each scheme has a **Build pre-action** that writes the env file name to `/tmp/envfile` and runs react-native-config's `BuildXCConfig.rb`, which generates `ios/tmp.xcconfig` (git-ignored).
2. The target's base configuration is `ios/Config/Debug.xcconfig` or `ios/Config/Release.xcconfig`. Each one includes the CocoaPods xcconfig **and** `tmp.xcconfig`.
3. The build settings use `PRODUCT_BUNDLE_IDENTIFIER = $(APP_BUNDLE_ID)`, and Info.plist uses `CFBundleDisplayName = $(APP_DISPLAY_NAME)`.
4. The react-native-config pod reads `/tmp/envfile` to generate the values JS sees.

**Android**: `android/app/build.gradle` defines `project.ext.envConfigFiles` (flavor + build type mapped to an env file), then applies `dotenv.gradle`. The `productFlavors` block sets `applicationIdSuffix` and `app_name`, and `build_config_package` tells react-native-config where `BuildConfig` lives. A ProGuard keep rule protects `BuildConfig` in release builds.

## Adding a variable (4 places)
1. All three `.env.*` files
2. `.env.example`, with a comment on its own line (inline comments aren't stripped)
3. `EnvSchema` in `src/config/env/env.ts`
4. `NativeConfig` in `src/react-native-config.d.ts`

Then **rebuild natively**. A Metro reload does not pick up env changes.

## Rules
- **No secrets in env files.** Every value ships inside the app binary and can be extracted. Secrets belong on a backend.
- The `.env.*` files are committed on purpose because they aren't secret. Personal overrides go in `.env.*.local` (git-ignored).
- `/tmp/envfile` is shared across projects on the machine. It's overwritten on every scheme build, so don't edit it by hand.
- If you ever see the wrong environment's values, clean the build (`rm -rf ios/build`, or Product → Clean Build Folder) and rebuild.

## Still to do before a real release
- Separate **app icons** per environment (e.g. an "α"/"β" badge) so testers can tell them apart
- **Signing**: an Apple team and provisioning profiles for the 3 bundle IDs, and an Android release keystore (release currently uses the debug keystore)
- If you add Firebase or other SDKs, one config file per environment (`GoogleService-Info.plist` / `google-services.json` per flavor)
