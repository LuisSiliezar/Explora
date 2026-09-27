# Logging

All diagnostics go through one port, `LoggerPort` (`src/domain/services/logger.port.ts`). The UI gets it as `deps.logger` from `useDependencies()`. Classes and use-cases receive it through their constructor or `deps`. `console` is banned by ESLint (`no-console`) everywhere except the one implementation, `ConsoleLogger`.

## Levels

| Level | Use it for | Example |
|---|---|---|
| `debug` | Detail that only helps while developing | Haptics failed, BootSplash hide failed |
| `info` | Normal milestones | `Container ready` at startup |
| `warn` | Something failed and the app recovered | Corrupt storage reset, served the cached catalog, reminder cancel failed |
| `error` | Something failed and nothing recovered | A query or mutation that ends in an error, an uncaught JS error |

`LOG_LEVEL` in each `.env.*` file sets the lowest level printed. Anything below it is dropped:

| Env | `LOG_LEVEL` |
|---|---|
| dev | `debug` |
| staging | `info` |
| prod | `warn` |

In dev builds, `[Explora]` lines print to the Metro console but don't pop LogBox banners (`ignoreAppLogsInLogBox`, called from `index.js`). Handled failures would otherwise cover the tab bar and break the e2e flows that fail on purpose. Uncaught crashes still show the red box.

`silent` turns everything off. Like every env value, changing it needs a native rebuild (see [environment.md](environment.md)).

## Where logs come from

- **Global, no per-hook code** (`src/config/logging`, installed in `AppProviders`):
  - `logQueryErrors` logs every TanStack query or mutation that ends in an error. It logs only the final failure, not each retry, and skips cancellations. Network, validation and refresh failures all land here, so hooks don't log their own `onError`.
  - `installGlobalErrorLogger` logs uncaught JS errors, then calls React Native's previous handler, so the red box and crash behavior don't change.
- **Recovered failures** (`warn`): each `catch` that falls back instead of throwing records what happened. Examples: corrupt favorites or added activities in storage, the offline cache fallback, reminder cancels, the notification that opened the app, location and photo failures.
- **Deliberately not logged**: `AxiosAdapter` (its `DomainError` reaches `logQueryErrors`, so logging here too would duplicate every entry) and `detectLanguage` (a pure locale fallback that runs before the container exists).

## Writing a log line

```ts
logger.warn('Cancelling a reminder failed', { reminderId, error });
```

- Keep the message a short, fixed sentence and put the variable parts in the context object. That keeps the lines searchable.
- Pass errors as they are. `ConsoleLogger` turns `Error` and `DomainError` into `{ name, code, message, cause }`.
- Never log personal data (photo URIs, coordinates) or anything from env files you wouldn't ship.

## Adding a remote logger

Write another class that implements `LoggerPort` (for example `SentryLogger` in `infrastructure/services`) and choose it in `container.ts`. To keep console output as well, write a small `CompositeLogger` that forwards to both. No caller changes, because everything depends on the port.

## Testing

`createFakeLogger()` in `__tests__/helpers/fakes.ts` returns `jest.fn()`s. Assert that a recovered failure was logged:

```ts
expect(logger.warn).toHaveBeenCalledWith('Stored favorites are corrupt, starting empty', expect.anything());
```
