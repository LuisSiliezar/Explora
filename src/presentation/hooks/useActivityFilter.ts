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
  const allCategories = useMemo(() => getCategories(activities), [activities]);
  const activeCount = countActiveFilters({ query, categories, duration });
  const hasFilters = !!query.trim() || activeCount > 0;

  return {
    query,
    categories,
    duration,
    setQuery,
    toggleCategory,
    toggleDuration,
    reset,
    results,
    allCategories,
    activeCount,
    hasFilters,
  };
};
