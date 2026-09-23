# ADR-006: NativeWind for styling

**Status:** Accepted

**Context:** The Claude Design prototype is written as utility-style inline CSS, with dozens of spacing, radius and type values. Rebuilding it with `StyleSheet` plus `useTheme()` objects made every screen long and hard to compare with the design. Dark mode still has to work.

**Decision:** Use NativeWind v4 (Tailwind v3). v5 was ruled out because it requires `@expo/metro-config`. Colors are CSS variables generated from one palette (`theme/palette.js` → `global.css` → `tailwind.config.js`), so every color class is theme-aware and there are no `dark:` variants. `useTheme()` stays for the few imperative color props.

**Consequences:**
- (+) Screens read like the prototype. Dark mode comes free through the variables.
- (+) Tokens stay enforced: there are no raw hex values in components, only named classes.
- (−) Adds Reanimated 4 and Worklets, a Babel preset, a Metro wrapper and `global.css`. Jest needs the Reanimated resolver (`jest.config.js`).
- (−) Class names must be literal strings (Tailwind scans the source), so dynamic tints go through the `categoryTint` map.
