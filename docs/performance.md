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

## Results

Pixel_10 **emulator** (`sdk_gphone16k_arm64`, Android 17, arm64, on an Apple Silicon Mac), `stagingRelease`
(Hermes, New Architecture, not debuggable), 1200 items, `.maestro/perf/1000-items.yaml`, 2026-09-24.
Commit `3f278f4-dirty` (the uncommitted refresh work on `develop`). Nothing else ran on the emulator during a capture.

| Run | Janky frames | Legacy janky | p50 / p90 / p95 / p99 (ms) | Slow UI thread | Slow issue draw commands |
|---|---|---|---|---|---|
| `perf/20260924-170211` | 7.29% | 0.34% | 18 / 21 / 21 / 22 | 6 | 201 |
| `perf/20260924-170412` (median) | **6.99%** | 0.19% | **18 / 21 / 21 / 22** | 7 | 188 |
| `perf/20260924-170612` | 3.69% | 0.06% | 18 / 21 / 21 / 22 | 2 | 110 |

**Reading it:** the frame-time distribution is one tight hump at 16–22 ms with no long tail (the worst frame of a run is ~32 ms).
The "janky" frames are almost all **Slow issue draw commands** (RenderThread submitting GPU work, which on an
emulator goes through the host GPU translation layer). The UI thread is slow in only 2–7 frames per run, and bitmap uploads
are 0. Legacy janky (the app's own frame work over budget) is under 0.4%. So on this emulator the app is not the bottleneck;
a real low-end phone is still needed for a device verdict (see Limitations).

The two older one-off runs (`perf/20260923-*`, `b544820-dirty`) are superseded by these.

## Improvement (before/after)

The improvement submitted for Part 2 is the Android reminder banner, in [improvement.md](improvement.md). This section records the performance fixes that were tried first and not kept.

Two candidate fixes were measured against the baseline above, with the same device, build type, dataset and scenario. **Neither improved it, so
neither was kept**; `ActivityThumb` is unchanged.

| | Before | Fix A | Fix B |
|---|---|---|---|
| Change | – | `ActivityThumb` `Image`: `fadeDuration={0}` + `resizeMethod="resize"` | `ActivityThumb`: drop the `overflow-hidden` clip and round the `Image` itself |
| Why try it | – | skip the fade on recycled cells, decode at display size | the jank is in "issue draw commands"; a rounded clip per cell is GPU work |
| Janky frames (median of 3) | 6.99% | 6.83% | 29.23% |
| Frame time p50 / p90 / p99 (ms) | 18 / 21 / 22 | 17 / 21 / 23 | 32 / 61 / 133 |
| Slow UI thread (median) | 6 | 5 | 477 |
| Raw runs | `perf/20260924-170211`, `-170412`, `-170612` | `perf/20260924-170932`, `-171135`, `-171336` | `perf/20260924-171739`, `-172132`, `-172431` |
| Verdict | – | no measurable change: inside the baseline's own spread (3.69–7.29%). Bitmap uploads were already 0, so there was nothing to save | **much worse**: rounding the image natively costs more than clipping the parent. Reverted |

A control run of the unchanged "before" APK right after Fix B (`perf/20260924-172740`: 6.79%, 17 / 19 / 20 ms, 2 slow UI
frames), taken while the host was under *more* load, confirms that Fix B's numbers come from the change, not from host noise.

**Conclusion:** at 1200 items the list holds a steady ~17–18 ms frame on the emulator with no long stalls, and the
remaining misses are in GPU submission rather than JS, layout or image decoding. The honest next step is a capture on a
real low-end Android phone, not another speculative fix.

## Rules for new code
- Never `.map()` inside `renderItem` or create objects or closures per row in the list's parent without `useCallback` or `useMemo`.
- Don't pass whole arrays or objects that change identity to rows.
- Keep images small (the camera service caps at 1280 px, quality 0.7).
- If items get heterogeneous layouts, use FlashList's `getItemType`.
