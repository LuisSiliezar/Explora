import {
  countActiveFilters,
  filterActivities,
  getCategories,
} from '@core/use-cases';
import { DevSeedActivityDataSource } from '@infrastructure/datasources';
import { InMemoryActivityDataSource, seedActivities } from './helpers/fakes';

describe('filterActivities', () => {
  it('returns the same array when the filter is empty', () => {
    expect(
      filterActivities(seedActivities, {
        query: '  ',
        categories: [],
        duration: null,
      }),
    ).toBe(seedActivities);
  });

  it('matches title, description and location case-insensitively', () => {
    const ids = filterActivities(seedActivities, {
      query: 'WALK',
      categories: [],
      duration: null,
    }).map(a => a.id);
    expect(ids).toEqual(['act-001', 'act-002']);
    expect(
      filterActivities(seedActivities, {
        query: 'central library',
        categories: [],
        duration: null,
      }),
    ).toHaveLength(1);
  });

  it('combines query and category', () => {
    const result = filterActivities(seedActivities, {
      query: 'workshop',
      categories: ['Workshops'],
      duration: null,
    });
    expect(result.every(a => a.category === 'Workshops')).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('matches any of several categories', () => {
    const result = filterActivities(seedActivities, {
      query: '',
      categories: ['Culture', 'Leisure'],
      duration: null,
    });
    expect(result).toHaveLength(6);
    expect(
      result.every(a => a.category === 'Culture' || a.category === 'Leisure'),
    ).toBe(true);
  });

  it.each([
    ['short', ['act-002', 'act-004']],
    ['long', ['act-011']],
  ] as const)('filters %s durations', (duration, ids) => {
    expect(
      filterActivities(seedActivities, {
        query: '',
        categories: [],
        duration,
      }).map(a => a.id),
    ).toEqual(ids);
  });

  it('treats 60 and 120 minutes as 1–2h', () => {
    const mid = filterActivities(seedActivities, {
      query: '',
      categories: [],
      duration: 'mid',
    });
    expect(mid).toHaveLength(9);
    expect(
      mid.every(a => a.durationMinutes >= 60 && a.durationMinutes <= 120),
    ).toBe(true);
  });

  it('counts active filters without the text query', () => {
    expect(
      countActiveFilters({
        query: 'walk',
        categories: ['Outdoors', 'Culture'],
        duration: 'short',
      }),
    ).toBe(3);
  });

  it('lists distinct sorted categories', () => {
    expect(getCategories(seedActivities)).toEqual([
      'Culture',
      'Leisure',
      'Outdoors',
      'Workshops',
    ]);
  });

  it('handles 1200 items quickly', async () => {
    const many = await new DevSeedActivityDataSource(
      new InMemoryActivityDataSource(),
      100,
    ).getAll();
    expect(many).toHaveLength(1200);
    expect(new Set(many.map(a => a.id)).size).toBe(1200);

    const start = Date.now();
    const result = filterActivities(many, {
      query: 'garden',
      categories: ['Outdoors'],
      duration: null,
    });
    expect(Date.now() - start).toBeLessThan(50);
    expect(result).toHaveLength(100);
  });
});
