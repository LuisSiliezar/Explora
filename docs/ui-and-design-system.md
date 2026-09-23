# UI and design system

The UI implements the **"Explora Prototype (no photos)"** Claude Design project: typographic cards tinted by category, Figtree + IBM Plex Mono, a green accent (`#7ED957`), and a flat tab bar.

## Screen flow

```
BootSplash (native) → SplashScreen (white, looping logo Lottie, waits for the catalog, min 1.2 s)
  first run:  Onboarding (3 steps) → Auth (sign in / create / continue as guest)
  afterwards: Tabs [Browse · Favorites · Settings] + ActivityDetail + Auth (modal from Settings)
```

`RootNavigator` switches between the two stacks on `settings.onboardingDone`. The splash is an overlay in `AppRoot`, so the navigator (and the catalog query) mounts right away underneath it.

## Styling: NativeWind v4

- Write styles as `className` (Tailwind v3 syntax). The Babel preset (`nativewind/babel`) and `withNativeWind` in `metro.config.js` compile them. The preset also registers the Reanimated/Worklets plugin, so don't add it again.
- **Colors are tokens, never hex.** `theme/palette.js` holds the light and dark palettes. `global.css` exposes them as CSS variables (light in `:root`, dark in `@media (prefers-color-scheme: dark)`), and `tailwind.config.js` turns each token into a class: `bg-background`, `text-text-muted`, `border-border`, `bg-primary`, `text-accent`, `bg-outdoors-bg`... Dark mode needs no `dark:` variants.
- When you add or change a color, edit `palette.js` **and** `global.css` (`__tests__/i18n-theme.test.ts` fails if they drift). Values in CSS are `R G B`, so opacity modifiers like `bg-black/40` keep working.
- Tailwind only generates classes it can see in the source, so dynamic names must be literal strings. Category tints go through `categoryTint` in `theme/tokens.ts`.
- `useTheme()` is for values that can't be classes: navigation theme, `placeholderTextColor`, `ActivityIndicator`, `RefreshControl`, the toast styles.

Card artwork is `ActivityThumb`: a bundled photo from `activityImage()` (`theme/activityImages.ts`) with a duration badge in the category tint. It uses the activity's own photo, then its category photo, then `DurationTile` if the image fails. The activity detail header shows the same photo full-bleed, and the onboarding step cards use the category photos (`categoryImage()`). Sources are listed in [image-credits.md](image-credits.md).

## Typography

- Fonts: Figtree (400/500/600/700) and IBM Plex Mono (400/500) in `src/assets/fonts`, linked with `npx react-native-asset` (`react-native.config.js`). There's one family per weight (`font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, `font-mono`, `font-mono-medium`), because Android can't select a weight from one family name.
- Always use `components/shared/Text`, never RN `Text`. It defaults to Figtree in the theme text color, and it applies **Settings → Text size** (`textScale` 0.92 / 1 / 1.12) on top of whatever the className sets.
- Mono uppercase captions ("CATEGORY", "LOCATION") use `SectionLabel`.

## Components (`components/shared`)

`Button` (primary / secondary / danger / destructive / inverse / link), `Chip`, `Toggle`, `Pill`, `DurationTile`, `ActivityThumb`, `ActivityCard` / `ActivityGridCard`, `FavoriteButton` (heart pop), `Icon`, `IconButton`, `TextField`, `Banner`, `OfflineBanner`, `Dialog` (+ `DialogBadge`), `BottomSheet`, `ActivitySkeleton`, `EmptyState`, `ErrorState`. The custom `TabBar` lives in `components/navigation`.

## Icons

- Icons are [Lucide](https://lucide.dev) vectors (`lucide-react-native`, drawn with the existing `react-native-svg`). Use `<Icon name="heart" size={20} color="accent" filled />` from `components/shared/Icon`; it's the only file that imports lucide.
- `name` is a key of the `ICONS` map in `Icon.tsx`. To add an icon, import it there and give it an app-level name (`back`, `forward`, `browse`...). Named imports keep the bundle to the icons we use.
- `color` is a palette token resolved through `useTheme()`, so dark mode works without a class. `colorValue` takes a raw color only where one already exists (onboarding's category tints). Icons don't scale with Settings → Text size.
- Icons are decorative: the parent `Pressable` carries the `accessibilityLabel`. Don't draw icons with Unicode glyphs in `Text`.
- Jest maps `lucide-react-native` to its CommonJS build (`jest.config.js`), because the RN preset doesn't transform its `.mjs` entry.

## Copy and languages

All UI copy lives in `presentation/i18n/strings.ts` (English and Spanish, ported from the prototype). Use `const t = useT(); t('key', { s, n })`. Catalog content (titles, descriptions, category names) comes from the data source and is **not** translated. Add every new key to both languages; a test checks that the keys match.

## Feedback

- **Toasts**: `useToast().show(message)` or `.withAction(message, label, onPress)`, backed by `sonner-native`. Removing a favorite shows **Undo**, which calls `restoreFavoriteUseCase`.
- **Haptics**: `useDependencies().haptics.selection() | success() | warning()`.
- **Dialogs** replace `Alert` for permission pre-prompts and confirmations, so they follow the theme and the language.

## Motion

- Tokens live in `presentation/theme/motion.ts`: `duration` and `enter(order)`, a staggered `FadeInDown` for a screen's top-level blocks (`entering={enter(0)}`, `enter(1)`…).
- Screen transitions are navigator options in `routes/RootNavigator.tsx`: the stack slides from the right (ActivityDetail, swipe back works), Onboarding ⇄ Tabs cross-fade, and the tabs fade on switch.
- Never put `entering` on list rows (`ActivityList`): it costs frames at 1000+ items.
- Reanimated layout animations honor the OS "Reduce Motion" setting on their own.

## Not implemented from the prototype

- Real sign-in and sync. Auth only validates and stores the account on the device.
- French ("needs download") and the weekly-summary schedule. The switch is stored, but nothing sends it.
- The prototype's "scenario panel" (its controls for forcing states: offline, error, permissions). The app takes those states from the real system instead.
