import { distanceKm, sortByDistance, sortByTitle } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { seedActivities } from './helpers/fakes';

const origin = { latitude: 37.3349, longitude: -122.009 };

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(origin, origin)).toBe(0);
  });

  it('matches a known distance (SF → LA ≈ 559 km)', () => {
    const sf = { latitude: 37.7749, longitude: -122.4194 };
    const la = { latitude: 34.0522, longitude: -118.2437 };
    expect(distanceKm(sf, la)).toBeGreaterThan(550);
    expect(distanceKm(sf, la)).toBeLessThan(570);
  });
});

describe('sortByDistance', () => {
  it('puts the nearest activity first', () => {
    const rows = sortByDistance(seedActivities, origin);
    const distances = rows.map(row => row.distanceKm as number);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
    expect(rows[0].activity.id).toBe('act-010'); // Board Games, ~240 m
  });

  it('keeps activities without coordinates at the end', () => {
    const noCoords: Activity = {
      ...seedActivities[0],
      id: 'x',
      coordinates: undefined,
    };
    const rows = sortByDistance([noCoords, ...seedActivities], origin);
    expect(rows[rows.length - 1]).toEqual({
      activity: noCoords,
      distanceKm: null,
    });
  });
});

describe('sortByTitle', () => {
  it('sorts alphabetically with no distances', () => {
    const rows = sortByTitle(seedActivities);
    expect(rows[0].activity.title).toBe('Board Games');
    expect(rows.every(row => row.distanceKm === null)).toBe(true);
  });
});
