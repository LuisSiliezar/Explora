# State management

Use three tools, each for one kind of state. Don't mix them.

| Kind of state | Tool | Where | Example |
|---|---|---|---|
| **Server/async data** (anything fetched, cacheable, may be stale) | TanStack Query | `presentation/hooks/useActivities`, `useActivity`, `useCurrentLocation` | activity list, activity detail, device position |
| **User-owned persistent data** | Repository + `useSyncExternalStore` | `infrastructure/repositories/favorites.repository.impl.ts`, `hooks/useFavorites` | favorites, photo URI, reminder id |
| **Persisted UI state** (must survive kill/background) | zustand + `persist` | `core/store/activity-filter.store.ts`, `core/store/app-settings.store.ts` | search text, categories, duration; onboarding done, language, text size, permission statuses, local account |
| **Ephemeral UI state** | `useState` | component | "is scheduling…" spinner |

## Why favorites are not in TanStack Query or zustand
Favorites are **user data, and the device is the source of truth**. They must be readable synchronously at startup with no network. A repository keeps the persistence contract in the domain, so a future sync API can be added behind the same interface. `useSyncExternalStore` is React's built-in way to subscribe to such a source, and it's tear-free under concurrent rendering.

## TanStack Query defaults (`config/query/query-client.ts`)
- `staleTime` 5 min, `gcTime` 24 h
- Retries at most 2 times, and never for `NOT_FOUND` or `VALIDATION`
- `focusManager` follows `AppState` (refetches stale data on resume). `onlineManager` follows NetInfo, which pauses queries offline and resumes them when back online.
- `queryFn` receives an `AbortSignal` that is forwarded to the HTTP adapter, so leaving a screen cancels its requests.

## Zustand store rules
- Stores are **created by factories** that take a `KeyValueStorage` (DIP), and the container creates them.
- Components select slices: `filterStore(s => s.query)`. Never select the whole state.
- `partialize` persists only data, never functions.
- Changing a persisted shape? Bump `version` and add a `migrate` (see the filter store's v1 → v2 migration from one `category` to `categories[]`).

## App settings store (`core/store/app-settings.store.ts`)
Holds everything the user sets once and expects to keep: `onboardingDone`, `language`, `textScale`, `nearMe`, `locationPermission`, and `notifications`. UI reads slices with `useSettings(s => s.language)`. Writes go through the store's actions (`settingsStore.getState().setLanguage('es')`).

- The persisted payload is at `version: 2`. v1 also held a local sign-in `account`; `migrate` drops it and keeps everything else. Bump the version and extend `migrate` whenever a persisted field changes shape.
- `locationPermission` mirrors what the user answered in our pre-prompt / the OS prompt. Setting it to anything but `granted` also turns `nearMe` off.
