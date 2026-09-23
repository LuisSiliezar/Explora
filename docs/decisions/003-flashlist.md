# ADR-003: FlashList for large lists

**Status:** Accepted

**Context:** The list must stay smooth with 1000+ items. `FlatList` mounts and unmounts cells, which causes blank areas and JS spikes on low-end Android.

**Decision:** Use `@shopify/flash-list` v2 (cell recycling, New Architecture) through a single `ActivityList` component, with `memo` rows and per-row favorite subscriptions.

**Consequences:**
- (+) Smooth scrolling. One list component is shared by Explore and Favorites.
- (−) Recycled cells must not keep local state tied to the item. Derive state from props, or key it by id.
