# ADR-005: Environments as separate apps (react-native-config)

**Status:** Accepted

**Context:** We need development, staging and production builds with different configuration. Testers must be able to keep more than one installed at once.

**Decision:** Use one `.env.<env>` file per environment through react-native-config.
- iOS: three schemes with a pre-action that picks the env file and generates an xcconfig, so the bundle ID and display name come from the env. There are no extra build configurations, so the Pods config stays simple.
- Android: `productFlavors` (`dev`, `staging`, `prod`) with `applicationIdSuffix` and a per-flavor `app_name`, mapped to env files with `envConfigFiles`.

**Consequences:**
- (+) Dev, staging and prod install side by side, each with its own storage (favorites don't leak between them).
- (+) One mechanism serves JS, native build settings and Info.plist.
- (−) iOS depends on a scheme pre-action and the shared `/tmp/envfile`. Building without a scheme (e.g. raw `xcodebuild` with no `-scheme`) would use stale values.
- (−) Each new bundle ID needs its own signing setup.
