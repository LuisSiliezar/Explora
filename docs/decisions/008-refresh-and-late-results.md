# ADR-008: Refresh appends one activity, merged at read time

**Status:** Accepted

**Context:** Pull to refresh must add one random activity with a unique id, a failed refresh must add nothing, and a result that arrives late (after the user favorited, searched, left the screen or backgrounded the app) must not undo anything the user did. There is no backend.

**Decision:**
- `ActivityRepository.refresh()` asks an `ActivityFeedDataSource` for one new activity. Today that is `MockActivityFeedDataSource`: it builds a random DTO with an id like `gen-<time>-<seq>-<random>` and passes it through the same zod schema and mapper a real response would use.
- The repository saves it with **one synchronous MMKV write** (`AddedActivitiesStorage`, key `added-activities:v1`) and only then resolves. Any error before that write leaves storage untouched, so "failed = nothing added" holds by construction.
- `getAll()` reads the added items **after** awaiting the base catalog. So a catalog request that started before the refresh but lands after it still includes the new item. Late results can't drop it.
- In the UI, refresh is a TanStack **mutation** with its callbacks on the mutation (not on `mutate()`), so they run even if the screen unmounts. `onSuccess` appends by id with `setQueryData` (idempotent), and `useIsMutating` blocks a second pull while one is running.
- Favorites, filters and settings live in their own stores and are never touched by refresh.

**Consequences:**
- (+) A refresh survives an app kill as soon as it succeeds, and a kill mid-request adds nothing.
- (+) Swapping in a real `GET /activities/new` means one new datasource class; the repository and UI stay the same.
- (−) Added items are device-local. "Reset local data" clears them (`clearAdded()`).
