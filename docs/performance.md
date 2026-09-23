# Performance (1000+ items)

## What's in place
| Technique | Where |
|---|---|
| **FlashList v2** (cell recycling, no `estimatedItemSize` needed in v2) | `components/lists/ActivityList.tsx` (rows), `ActivityCarousel.tsx` (one horizontal list per category, nested in the vertical `CategorySections` list) |
| `memo` rows + stable `renderItem`/`keyExtractor` | `ActivityCard`, `ActivityCarouselCard`, `ActivityList`, `ActivityCarousel` |
| Fixed carousel card width (`CAROUSEL_CARD_WIDTH`), so horizontal cells never need measuring | `activity-card/constants` |
| Per-row subscription: `useIsFavorite(id)` re-renders **one** row when it toggles, not the list | `hooks/useFavorites.ts` |
| Precomputed lowercase `searchText` on each entity (computed once in the mapper) | `activity.mapper.ts` |
| Pure single-pass `filterActivities`, returns the same array when the filter is empty | `core/use-cases/activities/filter-activities.use-case.ts` |
| Search debounced 250 ms; filter runs in `useMemo` | `hooks/useActivityFilter.ts` |
| Mapper + zod validation run once per source (cached in `LocalActivityDataSource`) | datasource |
| Synchronous MMKV (no JSON bridge round-trips like AsyncStorage) | `mmkv-adapter.ts` |

The test suite checks that filtering 1200 items takes under 50 ms (`__tests__/filter-activities.test.ts`).

## Measuring on a release build (the evidence)
Debug builds run JS unoptimized and with dev checks, so their numbers mean nothing. Measure on the
**staging release** build: same optimized JS bundle and Hermes bytecode as prod, but it may seed data.
`DevSeedActivityDataSource` is wired whenever `DEV_SEED_MULTIPLIER > 0` and the env is **not** production.

### Dataset
`DEV_SEED_MULTIPLIER=100` copies the 12 bundled activities 100 times = **1200 items**, with unique ids
(`act-001-0` … `act-012-99`) and titles (`Botanical Garden Walk #1` …). Searching `Botanical` returns 100.

### Steps (Android)
1. In `.env.staging` set `DEV_SEED_MULTIPLIER=100`.
2. Plug in a device (preferably a low-end one) or boot an emulator. Only one on `adb devices`.
3. `yarn android:staging:release` (native rebuild, needed after env changes).
4. `yarn perf:android`. It:
   - runs `.maestro/perf/setup.yaml` (fresh install state, skip onboarding, list loaded; not measured),
   - resets `dumpsys gfxinfo`,
   - runs `.maestro/perf/1000-items.yaml`: 20 fast flings left + 10 right through the first
     carousel (300 cards), 4 flings down + 4 up through the sections, search `Botanical`
     (1200 → 100), 5 flings through the results, favorite a row, open detail, back,
   - saves `perf/<timestamp>/device.txt`, `gfxinfo.txt` and `summary.txt`.
5. Repeat 3 times and report the median run. Record the screen with `adb shell screenrecord` for the demo.

### Report template (fill in, keep the raw `perf/<timestamp>/` folder next to it)
| Field | Value |
|---|---|
| Device / emulator | e.g. Pixel 4a, Android 13 (or: emulator, API 35, x86_64, host CPU) |
| Build | `stagingRelease`, commit `<sha>`, Hermes, New Architecture |
| Dataset | 1200 activities (`DEV_SEED_MULTIPLIER=100`) |
| Scenario | `.maestro/perf/1000-items.yaml` |
| Total frames | |
| Janky frames (%) | |
| Frame time p50 / p90 / p95 / p99 (ms) | |
| Slow UI thread / missed deadline | |

How to read it: at 60 Hz a frame has 16.7 ms. Good = p90 under ~16 ms and janky frames under ~5%.
p99 shows the worst stutters (often the first scroll into unmeasured cells, or the search re-render).

### Limitations (write these next to the numbers)
- `gfxinfo` measures the **UI/render thread** only. A busy **JS thread** shows up as blank cells
  during fast scrolls or slow reaction to taps, not as janky frames. Check it with the Perf Monitor
  (JS fps) or a Hermes profile (below) during the same flow.
- An **emulator** runs on the host CPU/GPU: results are not a real-phone result. Name it as an
  emulator and prefer a real low-end device.
- Maestro swipes are synthetic, fixed-speed gestures; a human flings differently.
- The dataset is 12 records repeated: same 12 images and text lengths, so image decoding and
  layout are friendlier than with 1200 truly different items.
- One device, one run = anecdote. Report the median of 3 runs.

### Extra captures (optional)
- **JS thread**: release builds have no Dev Menu, so no Perf Monitor. Use a Perfetto system trace
  (Android Studio Profiler → CPU → System Trace, or `adb shell perfetto`) while the flow runs and
  look at the `mqt_v_js` thread. The Perf Monitor on a debug build is only a rough hint.
- **Re-renders**: React DevTools Profiler (debug build) with "Highlight updates". Toggling a
  favorite should flash only one row.
- **iOS**: Xcode → Product → Profile (Release) → Instruments "Animation Hitches", then run the
  same steps by hand or with the flow (change `appId` to the iOS staging bundle id).

## Rules for new code
- Never `.map()` inside `renderItem` or create objects or closures per row in the list's parent without `useCallback` or `useMemo`.
- Don't pass whole arrays or objects that change identity to rows.
- Keep images small (the camera service caps at 1280 px, quality 0.7).
- If items get heterogeneous layouts, use FlashList's `getItemType`.
