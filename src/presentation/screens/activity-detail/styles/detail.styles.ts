import { StyleSheet } from 'react-native';

// Bundled images default to their file's size: pin both dimensions so the photo fills its
// (unpadded) container.
export const detailStyles = StyleSheet.create({
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
