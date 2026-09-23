# Architecture

Explora uses a **layered Repository architecture**. The UI never knows where data comes from (bundled JSON today, maybe an API later), and every native or library dependency sits behind an interface.

## Layers

```
┌───────────────────────────── presentation ─────────────────────────────┐
│ screens · components · hooks (TanStack Query / zustand selectors)      │
└───────────────┬────────────────────────────────────────────────────────┘
                │ calls use-cases with deps from useDependencies()
┌───────────────▼──────────── core ───────────────────────────────────────┐
│ use-cases (business rules) · store (persisted UI state)                 │
└───────────────┬────────────────────────────────────────────────────────┘
                │ depends only on interfaces
┌───────────────▼──────────── domain ─────────────────────────────────────┐
│ entities · repository interfaces · datasource interfaces · ports · errors│
└───────────────▲────────────────────────────────────────────────────────┘
                │ implements
┌───────────────┴──────────── infrastructure ─────────────────────────────┐
│ DTOs+zod · mappers · datasources · repository impls · native services   │
└─────────────────────────────────────────────────────────────────────────┘
config: http/storage adapters · env · query client · di/container (composition root)
```

### The dependency rule
Dependencies point **inward, toward `domain`**. `domain` imports nothing. `infrastructure` implements `domain` interfaces. `presentation` gets implementations only through `useDependencies()`.

| Layer | Responsibility | Example |
|---|---|---|
| domain | What the app *is*: types and contracts | `Activity`, `ActivityRepository`, `NotificationPort`, `DomainError` |
| core | What the app *does*: rules | `toggleFavoriteUseCase` cancels the reminder on unfavorite |
| infrastructure | *How* the work gets done | `LocalActivityDataSource`, `StorageFavoritesRepository`, `NotifeeNotificationService` |
| presentation | *How it looks* | `ActivitiesScreen`, `ActivityCard`, `useActivities` |
| config | *Wiring* | `createContainer()`, `AxiosAdapter`, `MMKVStorageAdapter`, `env` |

### Composition root
`src/config/di/container.ts` is the **only** file that creates concrete classes. It:
- picks `RemoteActivityDataSource` when `API_URL` is set, otherwise `LocalActivityDataSource`
- wraps the source in `DevSeedActivityDataSource` in dev when `DEV_SEED_MULTIPLIER > 0`
- builds the repositories, native services (incl. haptics), the filter store and the app-settings store from one `KeyValueStorage`

`AppProviders` calls `createContainer()` once and passes the result down with `DependenciesProvider`. Tests pass `createFakeContainer()` instead.

### Why not the reference repo's `core/actions`?
In the reference (designliTestFinnhub), actions and use-cases overlapped, and use-cases called `HttpAdapter` directly. Here the **repository** owns data access, **use-cases** own the rules, and the **container** owns wiring, so `actions` had no job left. See [ADR-004](decisions/004-drop-core-actions.md).
