import type { ActivityFeedDataSource } from '@domain/datasources';
import type { Activity, ActivityCategory } from '@domain/entities';
import { ActivityMapper } from '@infrastructure/mappers';
import type { ActivityDto } from '@infrastructure/interfaces';

interface Template {
  title: string;
  description: string;
  location: string;
}

const TEMPLATES: Record<ActivityCategory, Template[]> = {
  Outdoors: [
    {
      title: 'River Kayak Tour',
      description: 'A guided paddle along the calm stretch of the river.',
      location: 'East Pier',
    },
    {
      title: 'Birdwatching Morning',
      description: 'Spot local birds with binoculars and a field guide.',
      location: 'Wetland Reserve',
    },
    {
      title: 'Forest Picnic Hike',
      description: 'An easy hike that ends with a picnic in a clearing.',
      location: 'Pine Ridge',
    },
  ],
  Culture: [
    {
      title: 'Street Art Walk',
      description:
        'Discover murals and the stories of the artists behind them.',
      location: 'Old Town',
    },
    {
      title: 'Local History Talk',
      description: 'A short talk about how the city grew over two centuries.',
      location: 'City Library',
    },
  ],
  Workshops: [
    {
      title: 'Watercolor Basics',
      description: 'Learn washes, layering and color mixing in one session.',
      location: 'Studio 9',
    },
    {
      title: 'Bread Baking Class',
      description: 'Knead, shape and bake your own loaf to take home.',
      location: 'Community Kitchen',
    },
  ],
  Leisure: [
    {
      title: 'Board Game Night',
      description: 'Try modern board games with friendly hosts.',
      location: 'Corner Café',
    },
    {
      title: 'Open-Air Cinema',
      description: 'A classic film on a big screen under the stars.',
      location: 'Central Lawn',
    },
  ],
};

const CATEGORIES = Object.keys(TEMPLATES) as ActivityCategory[];
const DURATIONS = [30, 45, 60, 75, 90, 120, 150];
/** Center of the bundled catalog; new items land within ~3 km of it. */
const ORIGIN = { latitude: 37.335, longitude: -122.02 };

/**
 * Stands in for "GET /activities/new": returns one random activity with a unique id.
 * The payload goes through the same zod schema and mapper as a real response.
 * `random` and `now` are injected so tests are deterministic.
 */
export class MockActivityFeedDataSource implements ActivityFeedDataSource {
  private sequence = 0;

  constructor(
    private readonly random: () => number = Math.random,
    private readonly now: () => number = Date.now,
  ) {}

  async fetchNew(): Promise<Activity> {
    return ActivityMapper.fromDto(this.createDto());
  }

  private createDto(): ActivityDto {
    const category = this.pick(CATEGORIES);
    const template = this.pick(TEMPLATES[category]);
    this.sequence += 1;
    const id = [
      'gen',
      this.now().toString(36),
      this.sequence.toString(36),
      Math.floor(this.random() * 36 ** 4).toString(36),
    ].join('-');
    return {
      id,
      ...template,
      category,
      durationMinutes: this.pick(DURATIONS),
      latitude: ORIGIN.latitude + (this.random() - 0.5) * 0.05,
      longitude: ORIGIN.longitude + (this.random() - 0.5) * 0.05,
    };
  }

  private pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.random() * items.length) % items.length];
  }
}
