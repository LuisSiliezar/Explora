import type { ImageSourcePropType } from 'react-native';
import type { Activity, ActivityCategory } from '@domain/entities';

/** Bundled (offline-safe) card photos. Sources and credits: docs/image-credits.md. */
const byId: Record<string, ImageSourcePropType> = {
  'act-001': require('@assets/images/activities/act-001.jpg'),
  'act-002': require('@assets/images/activities/act-002.jpg'),
  'act-003': require('@assets/images/activities/act-003.jpg'),
  'act-004': require('@assets/images/activities/act-004.jpg'),
  'act-005': require('@assets/images/activities/act-005.jpg'),
  'act-006': require('@assets/images/activities/act-006.jpg'),
  'act-007': require('@assets/images/activities/act-007.jpg'),
  'act-008': require('@assets/images/activities/act-008.jpg'),
  'act-009': require('@assets/images/activities/act-009.jpg'),
  'act-010': require('@assets/images/activities/act-010.jpg'),
  'act-011': require('@assets/images/activities/act-011.jpg'),
  'act-012': require('@assets/images/activities/act-012.jpg'),
};

const byCategory: Record<ActivityCategory, ImageSourcePropType> = {
  Outdoors: require('@assets/images/activities/category-outdoors.jpg'),
  Culture: require('@assets/images/activities/category-culture.jpg'),
  Workshops: require('@assets/images/activities/category-workshops.jpg'),
  Leisure: require('@assets/images/activities/category-leisure.jpg'),
};

/** Dev-seed copies are `act-001-3`: strip the copy suffix to reach the original's photo. */
const BASE_ID = /^act-\d{3}/;

/** The category's photo: fallback for activities without their own, and onboarding art. */
export const categoryImage = (
  category: ActivityCategory,
): ImageSourcePropType => byCategory[category];

/** The activity's own photo, else its category photo (seed copies, refresh-generated items). */
export const activityImage = (
  activity: Pick<Activity, 'id' | 'category'>,
): ImageSourcePropType => {
  const baseId = BASE_ID.exec(activity.id)?.[0];
  return (baseId && byId[baseId]) || categoryImage(activity.category);
};
