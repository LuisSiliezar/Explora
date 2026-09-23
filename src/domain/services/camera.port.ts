export type PhotoSource = 'camera' | 'library';

export interface CameraPort {
  /** Resolves with a local file URI, or null when the user cancels. */
  pickPhoto(source: PhotoSource): Promise<string | null>;
}
