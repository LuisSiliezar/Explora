import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { DomainError } from '@domain/errors';
import type { CameraPort, PhotoSource } from '@domain/services';

export class ImagePickerCameraService implements CameraPort {
  async pickPhoto(source: PhotoSource): Promise<string | null> {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1280,
      maxHeight: 1280,
    } as const;
    const response: ImagePickerResponse =
      source === 'camera'
        ? await launchCamera({ ...options, saveToPhotos: false })
        : await launchImageLibrary(options);

    if (response.didCancel) {
      return null;
    }
    if (response.errorCode) {
      const code =
        response.errorCode === 'permission' ? 'PERMISSION_DENIED' : 'UNKNOWN';
      throw new DomainError(code, response.errorMessage ?? response.errorCode);
    }
    return response.assets?.[0]?.uri ?? null;
  }
}
