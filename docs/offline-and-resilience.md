# Offline and resilience

## Requirements
1. The whole app works offline: catalog, details, favorites, reminders, photos and Near me.
2. Favorites are available offline.
3. The app survives backgrounding or process death without losing user changes.
4. A slow network response doesn't lose or corrupt user changes.

## How each is met
| Scenario | Mechanism |
|---|---|
| Cold start in airplane mode | Queries use `networkMode: 'offlineFirst'` (`config/query/query-client.ts`): the first attempt always runs, so the bundled JSON (or the cached catalog) loads instead of the query pausing forever. Only retries wait for the network. |
| Remote catalog (`API_URL` set) while offline | `CachedActivityDataSource` decorates `RemoteActivityDataSource`. It writes every good response to MMKV (`activities-cache:v1`) **synchronously**, and a `NETWORK` failure returns that last good copy, even after process death. |
| Offline with nothing cached yet | The decorator throws `DomainError('OFFLINE')`. That code isn't retried, so Browse and Detail show an offline-specific `ErrorState` (with a shortcut to Favorites) instead of a spinner. `refetchOnReconnect` recovers them automatically. |
| Connectivity changes mid-session | `useConnectivityToast` (mounted in `RootNavigator`) shows `toastOffline` with a warning haptic, then `toastOnline` on reconnect. `OfflineBanner` stays up while offline, and pull-to-refresh is blocked with a toast. |
| Open Favorites in airplane mode | `FavoritesScreen` reads only from `StorageFavoritesRepository`, which loads synchronously from MMKV. Each favorite stores a **full `Activity` snapshot**. |
| Open a favorite's detail offline | `useActivity` uses the favorite snapshot as `placeholderData`. |
| Toggle a favorite, then the OS kills the app | `commit()` writes to MMKV **synchronously** before notifying the UI. There's no debounce or async flush that could be lost. |
| Typing a search, app goes to background, gets killed | The zustand filter store persists `query` and `category` to MMKV on every change. |
| Slow or failing request | Axios `timeout` (`API_TIMEOUT_MS`), then `DomainError('NETWORK')`, then TanStack retry, then `StateView` with Retry. User data is never involved, because favorites don't wait on the network. |
| User leaves the screen mid-request | The `AbortSignal` cancels it. No state updates happen after unmount. |
| Goes offline mid-session | `onlineManager` pauses queries and resumes them when NetInfo reports online again. |
| Returns from background | `focusManager` refetches stale queries. Cached data stays on screen while refetching. |
| Corrupted persisted JSON | The repository's `load()` catches the error and starts empty instead of crashing. |
| Native call fails (e.g. reminder cancel) | The local change is already committed, and the native error is caught. The UI stays consistent. |

## When a remote API exists
- If favorites sync to a server, add an **outbox** (a queued mutations list in `KeyValueStorage`) that is flushed when online, and decide on a conflict policy (last-write-wins by `savedAt` is the simple default).
- Consider TanStack `persistQueryClient` with an MMKV persister.
