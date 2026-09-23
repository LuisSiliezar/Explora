module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Reanimated 4 / Worklets: resolves their web (JS) implementations under jest.
  resolver: 'react-native-reanimated/jest/resolver',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers/'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__tests__/helpers/style-mock.js',
    // lucide's react-native entry is .mjs, which the RN preset doesn't transform: use its CJS build.
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@shopify/flash-list|@notifee|react-native-.*|nativewind|sonner-native|lottie-react-native)/)',
  ],
};
