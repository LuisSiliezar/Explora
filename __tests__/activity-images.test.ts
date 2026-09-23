import type { Activity } from '@domain/entities';
import { activityImage } from '@presentation/theme';
import { seedActivities } from './helpers/fakes';

const withId = (id: string, category: Activity['category'] = 'Culture') => ({
  id,
  category,
});

describe('activityImage', () => {
  it('gives every catalog activity its own photo', () => {
    const sources = seedActivities.map(activityImage);
    expect(sources.every(Boolean)).toBe(true);
    expect(new Set(sources).size).toBe(seedActivities.length);
  });

  it('maps dev-seed copies to the original activity photo', () => {
    expect(activityImage(withId('act-003-7', 'Outdoors'))).toBe(
      activityImage(withId('act-003', 'Outdoors')),
    );
  });

  it('falls back to the category photo for unknown or generated ids', () => {
    const fallback = activityImage(withId('gen-1f3a', 'Leisure'));
    expect(fallback).toBeTruthy();
    expect(fallback).toBe(activityImage(withId('act-999', 'Leisure')));
    expect(fallback).not.toBe(activityImage(withId('gen-1f3a', 'Culture')));
  });
});
