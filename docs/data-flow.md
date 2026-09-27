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
                           └─ CachedActivityDataSource(          (when API_URL set)
                                RemoteActivityDataSource(http))  last good copy in MMKV
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
Infrastructure converts every failure into a `DomainError` with a `code` (`NOT_FOUND`, `NETWORK`, `OFFLINE`, `VALIDATION`, `PERMISSION_DENIED`, `UNKNOWN`). Queries use `networkMode: 'offlineFirst'`, so the first attempt always runs and only retries pause while offline. The query client doesn't retry `NOT_FOUND`, `VALIDATION` or `OFFLINE`. Screens show `ErrorState` with a Retry button.
