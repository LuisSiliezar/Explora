# ADR-007: Honor the OS text size up to 2×

**Status:** Accepted

**Context:** `components/shared/Text` capped the OS font scale at `maxFontSizeMultiplier={1.4}` to protect the prototype's layouts. The brief asks for large text support, and people using the largest accessibility sizes (iOS AX5, Android 200%) got text that stopped growing at 140%.

**Decision:** Raise the cap to **2×** (`MAX_FONT_SCALE` in `Text.tsx`). The in-app text size (S/M/L in Settings) still multiplies on top. A component may pass a lower `maxFontSizeMultiplier` for fixed-size chrome (badges, tab labels) only if it is also readable some other way (for example a screen-reader label).

**Consequences:**
- (+) Text keeps growing up to the largest system sizes on both platforms.
- (−) Cards, chips and the tab bar must wrap instead of truncating. Check the screens at the largest size before a release (see [../accessibility.md](../accessibility.md)).
- (−) Not unlimited: above 2× the carousel cards would need a different layout. That is a known limit, not a bug.
