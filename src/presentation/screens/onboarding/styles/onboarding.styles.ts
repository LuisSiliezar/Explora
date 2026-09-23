import { StyleSheet } from 'react-native';
import { PARALLAX } from '../constants';

// Bundled images default to their file's size: pin both dimensions so the photo fills its
// (unpadded) container. It overhangs both sides by the parallax travel so no edge shows.
export const onboardingStyles = StyleSheet.create({
  photo: {
    position: 'absolute',
    top: 0,
    left: `${-PARALLAX * 100}%`,
    width: `${100 + PARALLAX * 200}%`,
    height: '100%',
  },
});
