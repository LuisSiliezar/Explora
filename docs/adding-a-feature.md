# Adding a feature: walkthrough

Example: **"Recently viewed activities"**, persisted locally.

### 1. Domain: contract first
```ts
// src/domain/repositories/recently-viewed.repository.ts
import type { Activity } from '@domain/entities';
export interface RecentlyViewedRepository {
  getAll(): Activity[];          // stable reference
  push(activity: Activity): void;
  subscribe(listener: () => void): () => void;
}
```
Export it from `src/domain/repositories/index.ts`.

### 2. Infrastructure: implementation
```ts
// src/infrastructure/repositories/recently-viewed.repository.impl.ts
export class StorageRecentlyViewedRepository implements RecentlyViewedRepository {
  constructor(private readonly storage: KeyValueStorage, private readonly limit = 20) { /* load */ }
  // push(): dedupe, prepend, trim to limit, write synchronously, notify
}
```
If the data comes from an API instead, add a DTO + zod schema in `infrastructure/interfaces`, a mapper, and a datasource.

### 3. Core: the rule
```ts
// src/core/use-cases/activities/track-view.use-case.ts
export const trackViewUseCase = ({ recentlyViewed }: { recentlyViewed: RecentlyViewedRepository }, a: Activity) =>
  recentlyViewed.push(a);
```

### 4. Wire it (the only place with `new`)
```ts
// src/config/di/container.ts
export interface Dependencies { /* … */ recentlyViewed: RecentlyViewedRepository }
// in createContainer:
recentlyViewed: new StorageRecentlyViewedRepository(storage),
```
Add a fake to `__tests__/helpers/fakes.ts` → `createFakeContainer`.

### 5. Presentation
```ts
// src/presentation/hooks/useRecentlyViewed.ts
export const useRecentlyViewed = () => {
  const { recentlyViewed } = useDependencies();
  return useSyncExternalStore(recentlyViewed.subscribe, recentlyViewed.getAll);
};
```
Call `trackViewUseCase` from `ActivityDetail` in a `useEffect`, and render with `ActivityList`.

### 6. Test and document
- Unit-test the repository (persistence round-trip, dedupe, limit) and the use-case with fakes.
- Run `yarn validate`.
- Update `docs/folder-structure.md` or `state-management.md` if a new pattern was introduced, and add an ADR in `docs/decisions/` if you made a real trade-off.

## Checklist
- [ ] No concrete classes imported outside `container.ts`
- [ ] Only entities leave infrastructure (no DTOs in UI)
- [ ] Errors are `DomainError` with a code
- [ ] Persisted writes are synchronous and local-first
- [ ] Rows are `memo`, callbacks stable, lists use FlashList
- [ ] Theme tokens, dark mode, accessibility labels
- [ ] Tests + `yarn validate` green
