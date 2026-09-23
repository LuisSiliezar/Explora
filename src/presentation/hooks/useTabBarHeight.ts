import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

/**
 * Height of the floating tab bar, so scroll content can clear it.
 * 0 outside the tabs (unlike `useBottomTabBarHeight`, it never throws).
 */
export const useTabBarHeight = () => useContext(BottomTabBarHeightContext) ?? 0;
