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
    return new Promise(resolve =>
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      ),
    );
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
