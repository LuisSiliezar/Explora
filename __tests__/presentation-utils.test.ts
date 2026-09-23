import { DomainError } from '@domain/errors';
import { activityA11yLabel } from '@presentation/components/shared/activity-card/utils';
import {
  countLabelKey,
  nearMeDot,
} from '@presentation/screens/activities/utils';
import {
  distanceTo,
  errorToastKey,
} from '@presentation/screens/activity-detail/utils';
import {
  notificationsTextKey,
  permissionTextKey,
} from '@presentation/screens/settings/utils';
import { seedActivities } from './helpers/fakes';

const activity = seedActivities[0];

describe('activities utils', () => {
  it('nearMeDot is on when active, disabled when denied, off otherwise', () => {
    expect(nearMeDot(true, 'granted')).toBe('on');
    expect(nearMeDot(false, 'denied')).toBe('disabled');
    expect(nearMeDot(false, 'prompt')).toBe('off');
    expect(nearMeDot(false, 'granted')).toBe('off');
  });

  it('countLabelKey is singular only for one', () => {
    expect(countLabelKey(1)).toBe('activityCount');
    expect(countLabelKey(0)).toBe('activitiesCount');
    expect(countLabelKey(12)).toBe('activitiesCount');
  });
});

describe('activity detail utils', () => {
  it('errorToastKey asks for permission only on PERMISSION_DENIED', () => {
    expect(errorToastKey(new DomainError('PERMISSION_DENIED', 'no'))).toBe(
      'toastPermissionNeeded',
    );
    expect(errorToastKey(new Error('boom'))).toBe('toastSomethingWrong');
  });

  it('distanceTo is null without an origin', () => {
    expect(distanceTo(undefined, activity)).toBeNull();
  });

  it('distanceTo is zero at the activity itself', () => {
    const withCoords = seedActivities.find(a => a.coordinates);
    expect(withCoords).toBeDefined();
    expect(distanceTo(withCoords!.coordinates, withCoords!)).toBe(0);
  });
});

describe('settings utils', () => {
  it('permissionTextKey maps each status', () => {
    expect(permissionTextKey('granted')).toBe('permGranted');
    expect(permissionTextKey('denied')).toBe('permDenied');
    expect(permissionTextKey('prompt')).toBe('permAsk');
  });

  it('notificationsTextKey prefers the on note, then ask vs off', () => {
    expect(notificationsTextKey('granted', true)).toBe('notifNote');
    expect(notificationsTextKey('prompt', false)).toBe('notifAsk');
    expect(notificationsTextKey('denied', false)).toBe('notifOff');
    expect(notificationsTextKey('granted', false)).toBe('notifOff');
  });
});

describe('activity card utils', () => {
  it('activityA11yLabel reads title, category, duration and location', () => {
    expect(activityA11yLabel(activity)).toBe(
      `${activity.title}, ${activity.category}, ${activity.durationMinutes} min, ${activity.location}`,
    );
  });
});
