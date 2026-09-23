# ADR-001: Repository pattern with ports and a composition root

**Status:** Accepted

**Context:** The data source is a bundled JSON file today and will probably be an API later. The app also uses three native SDKs whose libraries may change as React Native upgrades.

**Decision:** Domain interfaces (`ActivityRepository`, `ActivityDataSource`, ports) are implemented in infrastructure and wired only in `config/di/container.ts`. The UI gets dependencies from React context.

**Consequences:**
- (+) Switching to an API, or swapping a library, touches one class and the container.
- (+) Tests use fakes, and there's no `jest.mock` of our own code.
- (−) More files per feature than calling axios from a hook. This is accepted in exchange for testability and room to grow.
