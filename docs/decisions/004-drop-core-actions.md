# ADR-004: Drop `core/actions` from the reference structure

**Status:** Accepted

**Context:** The reference repo (designliTestFinnhub) had `core/actions` (orchestration) *and* `core/use-cases` (which called `HttpAdapter` directly). Their responsibilities overlapped.

**Decision:** Keep the same top-level structure, but give data access to **repositories**, rules to **use-cases**, and wiring to **`config/di`**. Remove `core/actions`.

**Consequences:**
- (+) Each concern has exactly one home (SRP, DRY).
- (−) Differs from the reference repo, so anyone familiar with it should read architecture.md.
