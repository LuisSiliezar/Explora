# Accessibility

## What's in place
| Area | How |
|---|---|
| Screen reader labels | Every pressable has `accessibilityRole` + `accessibilityLabel` (a project convention, see CLAUDE.md). Toggles, chips, tabs and radios expose `accessibilityState` (`checked` / `selected`). Headers use `accessibilityRole="header"`. |
| Announcements | Every toast is also announced with `AccessibilityInfo.announceForAccessibility` (`hooks/useToast.ts`), so VoiceOver/TalkBack users hear "New activity: …", "Couldn't refresh. Nothing was changed.", offline/online, and so on. The locating overlay is a polite live region. |
| Large text | `components/shared/Text` honors the OS font scale up to 2× ([ADR-007](decisions/007-large-text.md)), on top of the in-app S/M/L size. |
| Keyboard | The search field uses `returnKeyType="search"` and dismisses on submit. Lists use `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"`, so the first tap on a result opens it instead of just closing the keyboard. |
| Reduced motion | Reanimated entering animations follow the system setting. |

## Manual check before a release (both platforms)
1. Set the largest text size (iOS: Accessibility → Larger Text, max; Android: Font size + Display size, max).
2. Walk Browse → Search → Detail → Favorites → Settings. Nothing should be cut off without a way to read it, and no control should overlap another.
3. Turn on VoiceOver / TalkBack and repeat: every control reads a name, a role and its state; pull to refresh announces the result.
4. Search: type, press the keyboard's search key, scroll the results (the keyboard closes), tap a result (opens on the first tap).

Record the results in [test-scenarios.md](test-scenarios.md) (scenario 7).

## Results (2026-09-24)
Handoff builds (Android `devRelease` on the Pixel_10 emulator, Android 17; iOS `Explora-Dev` Release on the iPhone 17 Pro simulator, iOS 26.5). **How it was checked:** screenshots at the largest text size, and the accessibility tree (Android `uiautomator dump`, iOS the host accessibility tree while driving the Simulator). This is an automated/inspector pass, **not** a TalkBack/VoiceOver session by a person. Do one by hand before a release.

Fixed at the largest text size:
| Where | Problem | Fix |
|---|---|---|
| Tab bar | Labels broke mid-word ("Brow/se") | One line, shrink to fit, capped at 1.5× (`TAB_LABEL_MAX_FONT_SCALE`); the tab's `accessibilityLabel` still reads the full name ([ADR-007](decisions/007-large-text.md) allows this for chrome) |
| Settings rows | Titles truncated, then broke mid-word next to the value | Titles wrap; from a 1.6× OS scale the value moves under the title (`STACKED_ROW_FONT_SCALE`) |
| Search → "N matching activities" | Pushed "Clear all" off screen | The count wraps beside the link |
| Data & storage | "Last sync" ran into its value | Gap, label wraps, value right-aligned |
| Search field (iOS) | Text clipped to invisible (TextInput had no scale cap, fixed 54 pt height) | Same 2× cap as `Text`, the pill grows (`min-h`) |

Still open:
- **Search at the largest size:** the search field and filters are a fixed header, so on a phone they take most of the screen and results scroll in a ~60 px strip above the floating tab bar. It works, but barely. Fix options (needs a design decision): move the filters into the list header so they scroll away, or collapse them behind a "Filters" button at large sizes.
- Row titles in Favorites/Search truncate after 2 lines (location after 1). The full text is in the row's accessibility label and on the detail screen.

