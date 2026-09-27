import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { DomainError } from '@domain/errors';
import type { Coordinates } from '@domain/entities';
import type { LocationPort } from '@domain/services';

export class GeolocationLocationService implements LocationPort {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return new Promise(resolve => {
      // Answers only when the status *changes* (the first OS prompt). Once the user has
      // decided (or changed it in iOS Settings), it never calls back...
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
      // ...so a position probe reads the current status: it fails with PERMISSION_DENIED
      // right away when denied. POSITION_UNAVAILABLE still means we're authorized.
      Geolocation.getCurrentPosition(
        () => resolve(true),
        error => resolve(error.code === 2), // 2 = POSITION_UNAVAILABLE
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 86400000 },
      );
    });
  }

  getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) =>
      Geolocation.getCurrentPosition(
        ({ coords }) =>
          resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        error =>
          reject(
            new DomainError(
              error.code === 1 ? 'PERMISSION_DENIED' : 'UNKNOWN',
              error.message,
            ),
          ),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
      ),
    );
  }
}
