# Performance (1000+ items)

## What's in place
| Technique | Where |
|---|---|
| **FlashList v2** (cell recycling, no `estimatedItemSize` needed in v2) | `components/lists/ActivityList.tsx` |
| `memo` rows + stable `renderItem`/`keyExtractor` | `ActivityCard`, `ActivityList` |
| Per-row subscription: `useIsFavorite(id)` re-renders **one** row when it toggles, not the list | `hooks/useFavorites.ts` |
| Precomputed lowercase `searchText` on each entity (computed once in the mapper) | `activity.mapper.ts` |
| Pure single-pass `filterActivities`, returns the same array when the filter is empty | `core/use-cases/activities/filter-activities.use-case.ts` |
| Search debounced 250 ms; filter runs in `useMemo` | `hooks/useActivityFilter.ts` |
| Mapper + zod validation run once per source (cached in `LocalActivityDataSource`) | datasource |
| Synchronous MMKV (no JSON bridge round-trips like AsyncStorage) | `mmkv-adapter.ts` |

The test suite checks that filtering 1200 items takes under 50 ms (`__tests__/filter-activities.test.ts`).

## How to profile
1. Set `DEV_SEED_MULTIPLIER=100` in `.env` (12 × 100 = 1200 items), then rebuild (`yarn ios`).
2. Open the Dev Menu, then **Perf Monitor**. Scroll fast and type in search. JS and UI should stay near 60 fps.
3. Use React DevTools Profiler with "Highlight updates" on. Toggling ♥ should flash only one row.
4. Test on a **release build on a low-end Android device**. Debug builds are much slower.

## Rules for new code
- Never `.map()` inside `renderItem` or create objects or closures per row in the list's parent without `useCallback` or `useMemo`.
- Don't pass whole arrays or objects that change identity to rows.
- Keep images small (the camera service caps at 1280 px, quality 0.7).
- If items get heterogeneous layouts, use FlashList's `getItemType`.
