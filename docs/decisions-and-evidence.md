# Decisions and evidence

One page for the reviewer: what was decided, why, and where the proof is.

## Requirement → where it's met → proof

| Requirement | Where | Proof |
|---|---|---|
| Browse, search by title, filter by category, combined; back keeps both | `useActivityFilter`, `core/store/activity-filter.store.ts` (persisted zustand) | `filter-activities.test.ts`, `.maestro/02`, [S1](test-scenarios.md) |
| Favorites on disk, survive restart, offline with full details | `StorageFavoritesRepository` (sync MMKV writes, full `Activity` snapshot) | `favorites.test.ts`, `.maestro/04`, `06`, [S2](test-scenarios.md) |
| Refresh adds one random activity with a unique id; failure adds nothing | `ActivityRepositoryImpl.refresh`, `MockActivityFeedDataSource`, `AddedActivitiesStorage` ([ADR-008](decisions/008-refresh-and-late-results.md)) | `refresh-activities.test.ts`, `offline-feedback.test.tsx`, `.maestro/07`, `08`, [S3](test-scenarios.md), [S4](test-scenarios.md) |
| Loading, empty, error, retry | `ActivitiesContent`, `StateView`, `ErrorState` | [S5](test-scenarios.md) |
| Reviewer can reproduce success, failure, slow | Settings → Developer → Simulated network (dev/staging only) | `simulated-network.datasource.test.ts`, [S4–S6](test-scenarios.md) |
| Background/resume and late results don't undo the user | Read-time merge + mutation-level callbacks + separate stores ([ADR-008](decisions/008-refresh-and-late-results.md), [offline-and-resilience.md](offline-and-resilience.md)) | `refresh-activities.test.ts` ("late results"), `offline-feedback.test.tsx`, `.maestro/09`, [S6](test-scenarios.md) |
| Accessibility | [accessibility.md](accessibility.md), [ADR-007](decisions/007-large-text.md) | [S7](test-scenarios.md) |
| One native feature | Deep links + local notifications ([native-features.md](native-features.md)) | `linking.test.ts`, [S8](test-scenarios.md) |
| 1000+ items, real release measurement | FlashList, `DevSeedActivityDataSource` ×100 = 1200 items | [performance.md](performance.md) → Results |
| One improvement with before/after | _TODO: fill in after the perf runs_ | [performance.md](performance.md) → Improvement |
| 2+ automated tests (core + failure) | Jest: `refresh-activities.test.ts` (both), plus 18 other suites; Maestro flows 01–09 | `yarn test`, `yarn e2e` |

## Key decisions (short)
1. **Repository pattern, layered** ([ADR-001](decisions/001-repository-pattern.md)): the UI only sees interfaces, so a fake container powers tests and a real API can replace the JSON without touching screens.
2. **MMKV with synchronous writes** ([ADR-002](decisions/002-mmkv-persistence.md)): user changes are on disk before the UI updates, so an OS kill can't lose them.
3. **FlashList** ([ADR-003](decisions/003-flashlist.md)) for the 1200-item list.
4. **Refresh is append-only and merged at read time** ([ADR-008](decisions/008-refresh-and-late-results.md)): late responses can't drop or duplicate the new item.
5. **Network simulation as a decorator** (same pattern as `DevSeedActivityDataSource`): no `if (dev)` inside use-cases or screens, and nothing of it is wired in production.
6. **Large text up to 2×** ([ADR-007](decisions/007-large-text.md)).

## Known limits
- Refresh is backed by a mock feed; added items are device-local (no server sync or conflict policy yet, see [offline-and-resilience.md](offline-and-resilience.md#when-a-remote-api-exists)).
- The perf dataset is 12 records repeated, so images and text lengths are friendlier than real data (details in [performance.md](performance.md)).
- Toasts can't be asserted by Maestro on Android; they're covered by unit tests.

## Video outline (≤ 10 min)
1. (0:00) Launch the build (no Metro), onboarding skip, Browse.
2. (0:45) Search + category, open detail, back: state kept.
3. (1:45) Favorite, force-quit, airplane mode, reopen: favorite with full detail.
4. (3:00) Pull to refresh ×2: count 12 → 14 in Settings → Data.
5. (4:00) Developer → Failing: refresh fails, nothing changes. Retry state on a reset catalog.
6. (5:15) Developer → Slow: pull, search and favorite, Home, reopen: added once, nothing undone.
7. (6:45) VoiceOver/TalkBack + largest text walk-through.
8. (8:00) Deep link and reminder notification.
9. (9:00) Perf numbers before/after and the tests running.
