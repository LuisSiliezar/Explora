import { groupByCategory, sortByDistance, sortByTitle } from '@core/use-cases';
import { seedActivities } from './helpers/fakes';

const origin = { latitude: 37.3349, longitude: -122.009 };

describe('groupByCategory', () => {
  it('makes one section per category, in alphabetical order', () => {
    const sections = groupByCategory(sortByTitle(seedActivities));
    const categories = sections.map(section => section.category);
    expect(categories).toEqual([...new Set(categories)].sort());
    expect(sections.flatMap(section => section.rows)).toHaveLength(
      seedActivities.length,
    );
    for (const section of sections) {
      expect(
        section.rows.every(row => row.activity.category === section.category),
      ).toBe(true);
    }
  });

  it('keeps the incoming order inside each section', () => {
    const rows = sortByDistance(seedActivities, origin);
    for (const section of groupByCategory(rows)) {
      const distances = section.rows.map(row => row.distanceKm as number);
      expect([...distances].sort((a, b) => a - b)).toEqual(distances);
    }
  });

  it('leaves out empty categories', () => {
    const outdoors = sortByTitle(
      seedActivities.filter(activity => activity.category === 'Outdoors'),
    );
    expect(groupByCategory(outdoors).map(s => s.category)).toEqual([
      'Outdoors',
    ]);
    expect(groupByCategory([])).toEqual([]);
  });
});
