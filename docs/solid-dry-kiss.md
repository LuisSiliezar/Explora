# SOLID, DRY and KISS in Explora

Each principle below is tied to real code you can open.

## S: Single Responsibility
| File | Its one job |
|---|---|
| `infrastructure/mappers/activity.mapper.ts` | Validate and convert raw payloads into `Activity` |
| `infrastructure/datasources/local-activity.datasource.ts` | Read the bundled JSON |
| `infrastructure/repositories/activity.repository.impl.ts` | Answer queries about activities (`getById` → `NOT_FOUND`) |
| `core/use-cases/favorites/toggle-favorite.use-case.ts` | The favorite/unfavorite rule, including cancelling the reminder |
| `presentation/components/shared/ActivityCard.tsx` | Render one row |

A sign SRP is broken: a component that fetches, or a mapper that calls a network.

## O: Open/Closed
To add behavior, add code instead of editing code that already works.
- **Remote API**: `RemoteActivityDataSource` already exists. Set `API_URL` and the container picks it. No use-case or screen changes.
- **Profiling with 1000+ items**: `DevSeedActivityDataSource` is a *decorator* that wraps any source. Nothing else knows it exists.
- **Offline cache for a remote source**: write a `CachedActivityDataSource(remote, storage)` decorator and wrap the source in `container.ts`.

## L: Liskov Substitution
Any `ActivityDataSource`, `FavoritesRepository`, `KeyValueStorage` or port implementation can be swapped in without breaking callers.
- `MemoryStorage` and `MMKVStorageAdapter` are interchangeable, so tests use one and production uses the other.
- `__tests__/helpers/fakes.ts` builds a full `Dependencies` from in-memory fakes, and the whole app renders with it (`App.test.tsx`).
- Contracts that implementations must keep: `getById` rejects with `NOT_FOUND`, `getAll()` returns a stable reference, and `pickPhoto` resolves `null` when the user cancels (it doesn't throw).

## I: Interface Segregation
Ports are small and focused: `NotificationPort` (3 methods), `CameraPort` (1), `LocationPort` (2), `KeyValueStorage` (3). A use-case asks only for what it uses. For example, `attachPhotoUseCase` needs `{ favorites, camera }`, not the whole container.

## D: Dependency Inversion
`domain` and `core` import **interfaces only**. `container.ts` chooses the concrete classes, and `useDependencies()` delivers them. No screen imports `notifee`, `axios` or `mmkv`.

## DRY
- One `HttpAdapter` for every HTTP call, and one `KeyValueStorage` shared by favorites and the filter store
- `queryKeys` in one place
- `StateView` covers loading, empty and error states. `ActionButton` and `FavoriteButton` are reused across screens.
- Theme tokens in `theme/tokens.ts`, with no duplicated colors or spacing
- `ActivityList` is used by both Explore and Favorites.

## KISS
- Use-cases are plain functions of the form `(deps, ...args)`. No classes, no DI framework, no decorators or reflection.
- `filterActivities` is a single `Array.filter` over a precomputed `searchText`. There's no search library.
- Favorites use `useSyncExternalStore` over the repository, with no extra state library layer.
- Don't add an abstraction until a second implementation exists (the remote source is the only planned one).
