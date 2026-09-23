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
  // Darkens the top (status bar, Skip) and the bottom (text, dots, button) so white text reads on any photo.
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage:
      'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 18%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
  },
});
