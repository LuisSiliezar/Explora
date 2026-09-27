import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { KeyValueStorage } from '@config/adapters/storage';
import {
  EMPTY_ACTIVITY_FILTER,
  type ActivityCategory,
  type ActivityFilter,
  type DurationFilter,
} from '@domain/entities';

export interface ActivityFilterState extends ActivityFilter {
  setQuery: (query: string) => void;
  toggleCategory: (category: ActivityCategory) => void;
  /** Selecting the active duration again clears it. */
  toggleDuration: (duration: DurationFilter) => void;
  /** Leaving search: drops the query and duration, keeps the categories Browse shows. */
  clearSearch: () => void;
  reset: () => void;
}

/** v1 stored a single category. */
interface PersistedV1 {
  query?: string;
  category?: ActivityCategory | null;
}

/**
 * UI state that must survive backgrounding / process death (the search the user was typing).
 * Storage is injected (DIP) so tests use MemoryStorage.
 */
export const createActivityFilterStore = (storage: KeyValueStorage) =>
  create<ActivityFilterState>()(
    persist(
      set => ({
        ...EMPTY_ACTIVITY_FILTER,
        setQuery: query => set({ query }),
        toggleCategory: category =>
          set(state => ({
            categories: state.categories.includes(category)
              ? state.categories.filter(c => c !== category)
              : [...state.categories, category],
          })),
        toggleDuration: duration =>
          set(state => ({
            duration: state.duration === duration ? null : duration,
          })),
        clearSearch: () =>
          set({
            query: EMPTY_ACTIVITY_FILTER.query,
            duration: EMPTY_ACTIVITY_FILTER.duration,
          }),
        reset: () => set(EMPTY_ACTIVITY_FILTER),
      }),
      {
        name: 'activity-filter:v1',
        version: 2,
        storage: createJSONStorage(() => storage),
        partialize: ({ query, categories, duration }) => ({
          query,
          categories,
          duration,
        }),
        migrate: (persisted, version) => {
          if (version < 2) {
            const old = (persisted ?? {}) as PersistedV1;
            return {
              query: old.query ?? '',
              categories: old.category ? [old.category] : [],
              duration: null,
            };
          }
          return persisted as ActivityFilter;
        },
      },
    ),
  );

export type ActivityFilterStore = ReturnType<typeof createActivityFilterStore>;
