# Data flow

## Loading the list
```
ActivitiesScreen
  └─ useActivities()                          presentation/hooks (TanStack Query, key ['activities'])
       └─ getActivitiesUseCase(repo, signal)  core/use-cases
            └─ ActivityRepository.getAll()    domain interface
                 └─ ActivityRepositoryImpl    infrastructure
                      └─ ActivityDataSource.getAll(signal)
                           ├─ LocalActivityDataSource(json)   (default)
                           └─ RemoteActivityDataSource(http)  (when API_URL set)
                                └─ ActivityMapper.fromResponse(raw)  → zod validate → Activity[]
```
Then `useActivityFilter(data)` reads `query` and `category` from the zustand store, debounces the query (250 ms), and runs the pure `filterActivities` inside `useMemo`.

## Toggling a favorite
```
ActivityCard ♡ → useFavorites().toggle(activity)
  └─ toggleFavoriteUseCase({ favorites, notifications }, activity)
       ├─ favorites.add/remove        ← synchronous MMKV write, UI updates immediately
       └─ notifications.cancel(id)    ← only when removing and a reminder exists
StorageFavoritesRepository notifies subscribers →
  useSyncExternalStore re-renders only the rows whose useIsFavorite(id) changed
```

## Opening detail
`useActivity(id)` uses `placeholderData` from the list cache or the favorite snapshot, so the detail screen renders instantly, even offline.

## Errors
Infrastructure converts every failure into a `DomainError` with a `code` (`NOT_FOUND`, `NETWORK`, `VALIDATION`, `PERMISSION_DENIED`, `UNKNOWN`). The query client doesn't retry `NOT_FOUND` or `VALIDATION`. Screens show `StateView` with a Retry button.
