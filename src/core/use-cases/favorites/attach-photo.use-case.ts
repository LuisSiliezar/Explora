import type { Activity } from '@domain/entities';
import type { FavoritesRepository } from '@domain/repositories';
import type { CameraPort, PhotoSource } from '@domain/services';

interface Deps {
  favorites: FavoritesRepository;
  camera: CameraPort;
}

/** Attaching a photo implies favoriting. Returns the URI, or null when cancelled. */
export const attachPhotoUseCase = async (
  { favorites, camera }: Deps,
  activity: Activity,
  source: PhotoSource,
): Promise<string | null> => {
  const photoUri = await camera.pickPhoto(source);
  if (photoUri) {
    if (!favorites.isFavorite(activity.id)) {
      favorites.add(activity);
    }
    favorites.update(activity.id, { photoUri });
  }
  return photoUri;
};
