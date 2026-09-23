# UI and design system

The UI implements the **"Explora Prototype (no photos)"** Claude Design project: typographic cards tinted by category, a green accent (`#7ED957`), and a floating pill tab bar. Browse, Search and Settings follow a later redesign after Tripadvisor: photo carousels per category, search as its own tab, and a list-style Settings page. Type is Plus Jakarta Sans (headings) + DM Sans (everything else).

## Screen flow

```
BootSplash (native) → SplashScreen (white, looping logo Lottie, waits for the catalog, min 1.2 s)
  first run:  Onboarding (3 steps; Skip / Get started finish it)
  afterwards: Tabs [Browse · Search · Favorites · Settings] + ActivityDetail + SettingsDetail
```

`RootNavigator` switches between the two stacks on `settings.onboardingDone`. The splash is an overlay in `AppRoot`, so the navigator (and the catalog query) mounts right away underneath it.

## Styling: NativeWind v4

- Write styles as `className` (Tailwind v3 syntax). The Babel preset (`nativewind/babel`) and `withNativeWind` in `metro.config.js` compile them. The preset also registers the Reanimated/Worklets plugin, so don't add it again.
- **Colors are tokens, never hex.** `theme/palette.js` holds the light and dark palettes. `global.css` exposes them as CSS variables (light in `:root`, dark in `@media (prefers-color-scheme: dark)`), and `tailwind.config.js` turns each token into a class: `bg-background`, `text-text-muted`, `border-border`, `bg-primary`, `text-accent`, `bg-outdoors-bg`... Dark mode needs no `dark:` variants.
- When you add or change a color, edit `palette.js` **and** `global.css` (`__tests__/i18n-theme.test.ts` fails if they drift). Values in CSS are `R G B`, so opacity modifiers like `bg-black/40` keep working.
- Tailwind only generates classes it can see in the source, so dynamic names must be literal strings. Category tints go through `categoryTint` in `theme/tokens.ts`.
- `useTheme()` is for values that can't be classes: navigation theme, `placeholderTextColor`, `ActivityIndicator`, `RefreshControl`, the toast styles.
- Toasts come from `useToast()`. Choose the method that matches the outcome, since the dot color is how users tell toasts apart: `success` (green, it worked), `info` (grey, neutral: a sort changed or something was turned off), `warning` (amber, it didn't fail but the user is limited: offline, permission needed), `error` (red, it failed), and `withAction` (neutral, with an action such as Undo). The pill uses the `toast`/`on-toast`/`toast-border` tokens: dark in light mode, a raised surface in dark mode.

Card artwork is `ActivityThumb`: a bundled photo from `activityImage()` (`theme/activityImages.ts`) with a duration badge in the category tint. It uses the activity's own photo, then its category photo, then `DurationTile` if the image fails. The activity detail header shows the same photo full-bleed, and each onboarding step is a full-screen category photo (`categoryImage()`) with a dark gradient scrim and white (`text-on-photo`) text over it. Sources are listed in [image-credits.md](image-credits.md).

## Typography

- Fonts: **Plus Jakarta Sans** and **DM Sans**, each at 400/500/600/700, in `src/assets/fonts`, linked with `npx react-native-asset` (`react-native.config.js`). There's one family per weight, because Android can't select a weight from one family name:
  - `font-display`, `font-display-medium`, `font-display-semibold`, `font-display-bold` (Plus Jakarta Sans): screen titles, section and card titles, dialog titles, big numbers, `Button` labels.
  - `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold` (DM Sans): body text, places, chips, links, inputs, and the small uppercase tags and counts (`font-sans-medium` + tracking).
- Jakarta comes as static TTFs from the upstream repo (tokotype/PlusJakartaSans). DM Sans only ships as a variable font, so the static files were cut with `fonttools varLib.instancer` (`opsz=14`, one `wght` each) and renamed so each PostScript name matches its file name (`DMSans-Medium`...): iOS finds fonts by that name. Licenses (OFL) are in `docs/licenses/`.
- Fonts are native assets, so a Metro reload never picks them up. After adding or swapping one, rebuild both apps, and on Android run `./gradlew clean` first. A stale APK still holds the old files and silently falls back to Roboto. To check: `unzip -l android/app/build/outputs/apk/dev/debug/app-dev-debug.apk | grep ttf`.
- Sizes come **only** from the stock NativeWind scale. There are no `text-[Npx]`, `leading-[..]` or `tracking-[..]` values. NativeWind resolves `1rem` to **14px** on native, so the steps are:

  | class       | size  | line height |
  | ----------- | ----- | ----------- |
  | `text-xs`   | 10.5  | 14          |
  | `text-sm`   | 12.25 | 17.5        |
  | `text-base` | 14    | 21          |
  | `text-lg`   | 15.75 | 24.5        |
  | `text-xl`   | 17.5  | 24.5        |
  | `text-2xl`  | 21    | 28          |
  | `text-3xl`  | 26.25 | 31.5        |
  | `text-4xl`  | 31.5  | 35          |
  | `text-5xl`  | 42    | 1×          |
  | `text-6xl`  | 52.5  | 1×          |

  Each `text-*` sets its own line height. Only tight display headings add `leading-tight` or `leading-none`. Letter spacing uses `tracking-tighter`/`tight` on big headings and `tracking-wide`/`wider`/`widest` on small uppercase tags. The only numeric size left is `TOAST_FONT_SIZE` in `toaster.styles.tsx` (14 = `text-base`, times the in-app text size), because sonner styles can’t take a class.

- Always use `components/shared/Text`, never RN `Text`. It defaults to DM Sans at `text-base` size (14) in the theme text color, and it applies **Settings → Text size** (`textScale` 0.92 / 1 / 1.12) on top of whatever the className sets.
- Small uppercase captions ("CATEGORY", "LOCATION") use `SectionLabel`.

## Browse, Search and Settings

- **Browse**: the "Explora" title (`browse-title`), the `CategoryChips` row ("Near me" + categories), then `CategorySections`: one titled section per category (`groupByCategory`), each an `ActivityCarousel` (horizontal FlashList) of `ActivityCarouselCard`s. Category chips choose which sections show; "Near me" sorts the cards inside every section by distance. The first catalog load shows `CarouselSkeleton`.
- **Search** (`screens/search`, its own tab): `SearchField` (pill input with a clear ✕, focused every time the tab is), `SearchFilters` (category chips, duration, "N matching · Clear all") and `SearchResults` ("All results" as `ActivityCard` rows). While the query is inside its debounce window (`useActivityFilter().isSearching`) the results show `ActivitySkeleton`.
- Both tabs share the persisted filter store, but Browse reads `useActivityFilter().browseResults` (categories only), so a query or duration typed in Search never narrows Browse.
- **Settings**: `SettingsHeader` (big title) and one `SettingsLinkRow` per entry in `SETTINGS_SECTIONS` (label, current value from `useSettingsSummary`, chevron). Each row pushes `SettingsDetail` (`{ section }`), a stack screen with a back chevron that renders the section's panel: `LanguageOptions`, `NotificationsPanel`, `TextSizePicker`, `LocationPermissionRow` or `DataPanel`. To add a setting, add a key to `SETTINGS_SECTIONS`, a value in `useSettingsSummary` and a panel in `SECTION_CONTENT`.

## Components (`components/shared`)

`Button` (primary / secondary / danger / destructive / inverse / link), `Chip`, `Toggle`, `Pill`, `DurationTile`, `ActivityThumb`, `ActivityCard` (result row) / `ActivityCarouselCard` (tall photo card, 220pt wide) in `activity-card/`, `FavoriteButton` (heart pop; `icon`, `overlay` on a card photo, `circle` on detail), `Icon`, `IconButton`, `Banner`, `OfflineBanner`, `Dialog` (+ `DialogBadge`), `ActivitySkeleton` / `CarouselSkeleton` (in `skeleton/`), `EmptyState`, `ErrorState`. The custom `TabBar` lives in `components/navigation`.

**Skeletons.** Build a loading placeholder from `SkeletonGroup` (it drives one shared shimmer sweep and announces "Loading") and `SkeletonBlock`s sized with classes (`<SkeletonBlock className="h-4 w-[80%] rounded-[5px]" />`). The sweep is a `backgroundImage` linear gradient from the `skeleton` to the `skeletonHighlight` token, and it stays static when the OS asks for reduced motion. Screen-specific skeletons live with their screen (`activity-detail/components/DetailSkeleton`).

**Tab bar.** `TabBar` floats over the screens as a rounded `bg-raised` pill with a `bg-tag-surface` pill behind the focused tab. The Favorites icon is always an outline heart (hearts on cards and detail still fill when saved). It reports its height to React Navigation, so scroll content adds `useTabBarHeight()` to its bottom padding (`ActivityList`, `CategorySections` and Settings already do this).

A shared component stays a single flat file while it does one job. When it grows sub-parts, duplicated handlers or helpers, it becomes a folder with its own `components/`, `hooks/` and `utils/` (as `activity-card/` did). Parts used by one screen only live under that screen, not here. See [folder-structure.md](folder-structure.md#screen-folder-anatomy).

## Icons

- Icons are [Lucide](https://lucide.dev) vectors (`lucide-react-native`, drawn with the existing `react-native-svg`). Use `<Icon name="heart" size={20} color="accent" filled />` from `components/shared/Icon`; it's the only file that imports lucide.
- `name` is a key of the `ICONS` map in `Icon.tsx`. To add an icon, import it there and give it an app-level name (`back`, `forward`, `browse`...). Named imports keep the bundle to the icons we use.
- `color` is a palette token resolved through `useTheme()`, so dark mode works without a class. `colorValue` takes a raw color only where one already exists. Icons don't scale with Settings → Text size.
- Icons are decorative: the parent `Pressable` carries the `accessibilityLabel`. Don't draw icons with Unicode glyphs in `Text`.
- Jest maps `lucide-react-native` to its CommonJS build (`jest.config.js`), because the RN preset doesn't transform its `.mjs` entry.

## Copy and languages

All UI copy lives in `presentation/i18n/strings.ts` (English and Spanish, ported from the prototype). Use `const t = useT(); t('key', { s, n })`. Catalog content (titles, descriptions, category names) comes from the data source and is **not** translated. Add every new key to both languages; a test checks that the keys match.

## Feedback

- **Toasts**: `useToast().show(message)` or `.withAction(message, label, onPress)`, backed by `sonner-native`. Removing a favorite shows **Undo**, which calls `restoreFavoriteUseCase`.
- **Haptics**: shared pressables (`Button`, `Chip`, `Toggle`, `IconButton`, card taps) tick on press by default through `usePressHaptic`. Pass `haptic="success" | "warning" | "none"` to change that, and use `none` when the handler gives its own outcome feedback. Raw `Pressable`s use `usePressHaptic`, or call `useDependencies().haptics.selection() | success() | warning()` directly for async outcomes.
- **Dialogs** replace `Alert` for permission pre-prompts and confirmations, so they follow the theme and the language.

## Motion

- Tokens live in `presentation/theme/motion.ts`: `duration` and `enter(order)`, a staggered `FadeInDown` for a screen's top-level blocks (`entering={enter(0)}`, `enter(1)`…).
- Screen transitions are navigator options in `routes/RootNavigator.tsx`: the stack slides from the right (ActivityDetail, swipe back works), Onboarding ⇄ Tabs cross-fade, and the tabs fade on switch.
- The onboarding pager drives its dots and the background photo parallax from the scroll offset (`useAnimatedScrollHandler`) on the UI thread.
- Never put `entering` on list rows (`ActivityList`): it costs frames at 1000+ items.
- Reanimated layout animations honor the OS "Reduce Motion" setting on their own.

## Not implemented from the prototype

- Sign-in and sync. There are no accounts: favorites and settings live on the device only.
- French ("needs download") and the weekly-summary schedule. The switch is stored, but nothing sends it.
- The prototype's "scenario panel" (its controls for forcing states: offline, error, permissions). The app takes those states from the real system instead.
