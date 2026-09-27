import { useMemo } from 'react';
import type { Activity } from '@domain/entities';
import {
  countActiveFilters,
  filterActivities,
  getCategories,
} from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useDebouncedValue } from './useDebouncedValue';

export const useActivityFilter = (activities: readonly Activity[] = []) => {
  const { filterStore } = useDependencies();
  const query = filterStore(state => state.query);
  const categories = filterStore(state => state.categories);
  const duration = filterStore(state => state.duration);
  const setQuery = filterStore(state => state.setQuery);
  const toggleCategory = filterStore(state => state.toggleCategory);
  const toggleDuration = filterStore(state => state.toggleDuration);
  const clearSearch = filterStore(state => state.clearSearch);
  const reset = filterStore(state => state.reset);

  const debouncedQuery = useDebouncedValue(query);
  const results = useMemo(
    () =>
      filterActivities(activities, {
        query: debouncedQuery,
        categories,
        duration,
      }),
    [activities, debouncedQuery, categories, duration],
  );
  /** Browse: category chips only. What's typed in the Search tab doesn't narrow it. */
  const browseResults = useMemo(
    () =>
      filterActivities(activities, { query: '', categories, duration: null }),
    [activities, categories],
  );
  const allCategories = useMemo(() => getCategories(activities), [activities]);
  const activeCount = countActiveFilters({ query, categories, duration });
  const hasFilters = !!query.trim() || activeCount > 0;
  /** Typed but not applied yet (inside the debounce window). */
  const isSearching = query.trim() !== debouncedQuery.trim();

  return {
    query,
    categories,
    duration,
    setQuery,
    toggleCategory,
    toggleDuration,
    clearSearch,
    reset,
    results,
    browseResults,
    allCategories,
    activeCount,
    hasFilters,
    isSearching,
  };
};
