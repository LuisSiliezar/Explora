# Folder structure

```
App.tsx                         thin: imports global.css, <AppProviders><AppRoot/></AppProviders>
global.css                      NativeWind entry + theme CSS variables (mirrors theme/palette.js)
tailwind.config.js              palette tokens → class names, font families
src/
├── assets/
│   ├── data/activities.json    seed data (schemaVersion 1, optional lat/lng)
│   ├── bootsplash/             launch-screen logo (svg source + generated pngs)
│   ├── fonts/                  Plus Jakarta Sans + DM Sans (linked with react-native-asset)
│   ├── lottie/splash.json      the JS splash animation
│   └── images/
├── config/
│   ├── adapters/http/          HttpAdapter interface + AxiosAdapter (timeout, AbortSignal, DomainError)
│   ├── adapters/storage/       KeyValueStorage interface + MMKVStorageAdapter + MemoryStorage
│   ├── env/                    zod-validated react-native-config
│   ├── query/                  QueryClient + AppState/NetInfo lifecycle
│   └── di/container.ts         composition root + Dependencies type
├── domain/
│   ├── entities/               Activity, Favorite, ActivityFilter, Coordinates, preferences
│   ├── repositories/           ActivityRepository, FavoritesRepository (interfaces)
│   ├── datasources/            ActivityDataSource (interface)
│   ├── services/               NotificationPort, CameraPort, LocationPort, HapticsPort
│   └── errors/                 DomainError + codes
├── core/
│   ├── use-cases/activities/   getActivities, getActivityById, filterActivities, sortByDistance/sortByTitle
│   ├── use-cases/favorites/    toggleFavorite, restoreFavorite (undo), resetLocalData, attachPhoto, scheduleReminder
│   └── store/                  activity-filter.store, app-settings.store (zustand + persist)
├── infrastructure/
│   ├── interfaces/             DTOs + zod schemas (raw shapes)
│   ├── mappers/                DTO → entity
│   ├── datasources/            Local (JSON), Remote (HTTP), Cached + DevSeed (decorators)
│   ├── repositories/           ActivityRepositoryImpl, StorageFavoritesRepository
│   └── services/               Notifee, ImagePicker, Geolocation, HapticFeedback adapters
└── presentation/
    ├── providers/              AppProviders, DependenciesProvider/useDependencies (+ styles/ toaster, utils/ navigation theme)
    ├── routes/                 AppRoot (splash overlay), RootNavigator (onboarding | tabs), typed params
    ├── screens/                splash/, onboarding/, activities/, search/, activity-detail/, favorites/, settings/ (anatomy below)
    ├── components/lists/       ActivityList (FlashList rows), ActivityCarousel (horizontal FlashList)
    ├── components/navigation/  TabBar (+ constants/ tab labels and icons)
    ├── components/shared/      Text, Button, Chip, Toggle, Pill, DurationTile, activity-card/ (ActivityCard, ActivityCarouselCard), FavoriteButton, Banner, Dialog, skeleton/, ...
    ├── hooks/                  useActivities, useActivityFilter, useFavorites, useNearMe, useSettings, useToast, useIsOnline, ...
    ├── i18n/                   strings.ts (EN/ES) + useT
    ├── utils/                  formatDistance, formatSyncTime
    └── theme/                  palette.js (source of truth), tokens, motion, useTheme
__tests__/                      unit + render tests, helpers/fakes.ts
jest.setup.js                   native module mocks
```

## Screen folder anatomy
A screen file only composes: it calls hooks and lays out components. Everything else lives next to it, in subfolders that exist only when they have content:
```
screens/<feature>/
├── <Feature>Screen.tsx   composition only
├── components/           parts used only by this screen (CategorySections, SearchField, DetailHero, SettingsLinkRow…)
├── hooks/                screen-local state and handlers (useRefreshActivities, useNotificationSettings…)
├── constants/            static config (DURATIONS, STEPS, TEXT_SIZES, REMINDER_DELAY_MS…)
├── utils/                pure functions, unit-tested in __tests__/presentation-utils.test.ts
├── styles/               StyleSheet objects only (NativeWind classes stay inline in JSX)
└── index.ts              exports the screen only
```
A shared component that outgrows one job gets the same treatment (`components/shared/activity-card/`). Small single-purpose components (Button, Chip, Dialog…) stay flat files. A hook used by more than one screen belongs in `presentation/hooks`; a hook used by one screen belongs in that screen's `hooks/`.

## Where does X go?
| I'm adding… | Put it in |
|---|---|
| A new data shape from JSON or an API | `infrastructure/interfaces` (DTO + zod) and `infrastructure/mappers` |
| A business rule ("unfavoriting cancels its reminder") | `core/use-cases` |
| A wrapper around a native SDK | port in `domain/services`, implementation in `infrastructure/services`, wiring in `container.ts` |
| Screen-local UI state | `useState` in the component |
| UI state that must survive app kill | `core/store` (zustand persist) |
| A reusable visual element | `presentation/components/shared` |
| A part, hook, constant or helper used by one screen only | that screen's `components/`, `hooks/`, `constants/` or `utils/` |
| A color | `presentation/theme/palette.js` **and** `global.css` (a test checks they match) |
| UI copy | `presentation/i18n/strings.ts`, in every language |

## Naming
- `thing.entity.ts`, `thing.repository.ts` (interface), `thing.repository.impl.ts`, `thing.datasource.ts`, `thing.mapper.ts`, `thing.port.ts`, `thing.service.ts`, `verb-thing.use-case.ts`, `thing.store.ts`, `thing.responses.ts`
- Components and screens: `PascalCase.tsx`. Hooks: `useCamelCase.ts`.
- Every folder has an `index.ts` barrel. Import through `@alias/…`.
