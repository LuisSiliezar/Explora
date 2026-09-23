import { trigger } from 'react-native-haptic-feedback';
import type { HapticsPort } from '@domain/services';

const options = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};

/** The only file that imports react-native-haptic-feedback. */
export class HapticFeedbackService implements HapticsPort {
  selection(): void {
    this.fire('selection');
  }

  success(): void {
    this.fire('notificationSuccess');
  }

  warning(): void {
    this.fire('notificationWarning');
  }

  private fire(type: Parameters<typeof trigger>[0]): void {
    try {
      trigger(type, options);
    } catch {
      // Haptics are best-effort: never break a user action over them.
    }
  }
}
