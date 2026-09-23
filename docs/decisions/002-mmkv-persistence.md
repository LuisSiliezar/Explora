# ADR-002: MMKV for local persistence

**Status:** Accepted

**Context:** Favorites and in-progress UI state must survive the OS killing the app. AsyncStorage is async, so writes queued at the moment of backgrounding can be lost, and it's slow at startup.

**Decision:** Use `react-native-mmkv` v4 (synchronous, JSI/Nitro) behind `KeyValueStorage`. Repositories write synchronously on every mutation.

**Consequences:**
- (+) No lost writes, and a synchronous read at startup (no loading flash for favorites).
- (+) `MemoryStorage` implements the same interface, so it's used in tests.
- (−) Adds a native dependency (Nitro modules). It's not encrypted by default, so if favorites ever hold sensitive data, pass an `encryptionKey` from the Keychain or Keystore.
