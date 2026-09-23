import { DomainError } from '@domain/errors';
import { ActivityMapper } from '@infrastructure/mappers';
import activitiesJson from '@assets/data/activities.json';

describe('ActivityMapper.fromResponse', () => {
  it('maps the bundled JSON into 12 entities with a lowercase search index', () => {
    const activities = ActivityMapper.fromResponse(activitiesJson);
    expect(activities).toHaveLength(12);
    expect(activities[0].searchText).toContain('botanical garden walk');
    expect(activities[0].searchText).toContain('outdoors');
  });

  it('maps coordinates when present and tolerates their absence', () => {
    const [withCoords] = ActivityMapper.fromResponse(activitiesJson);
    expect(withCoords.coordinates).toEqual({
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    });

    const [withoutCoords] = ActivityMapper.fromResponse({
      schemaVersion: 1,
      activities: [
        {
          id: 'x',
          title: 'No geo',
          description: '',
          category: 'Leisure',
          location: 'Somewhere',
          durationMinutes: 30,
        },
      ],
    });
    expect(withoutCoords.coordinates).toBeUndefined();
    expect(withoutCoords).not.toHaveProperty('latitude');
  });

  it('rejects out-of-range coordinates', () => {
    const [first] = activitiesJson.activities;
    expect(() =>
      ActivityMapper.fromResponse({
        schemaVersion: 1,
        activities: [{ ...first, latitude: 123 }],
      }),
    ).toThrow(DomainError);
  });

  it('rejects an unsupported schemaVersion', () => {
    expect(() =>
      ActivityMapper.fromResponse({ ...activitiesJson, schemaVersion: 2 }),
    ).toThrow(DomainError);
  });

  it('rejects items with missing fields', () => {
    const broken = {
      schemaVersion: 1,
      activities: [{ id: 'x', title: 'No category' }],
    };
    expect(() => ActivityMapper.fromResponse(broken)).toThrow(
      /Invalid activities payload/,
    );
  });
});
