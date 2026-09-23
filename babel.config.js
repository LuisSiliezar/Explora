module.exports = {
  presets: [
    ['module:@react-native/babel-preset', { jsxImportSource: 'nativewind' }],
    // Also registers the Reanimated/Worklets plugin: don't add it again below.
    'nativewind/babel',
  ],
  plugins: [
    '@babel/plugin-transform-export-namespace-from', // required by zod v4
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        alias: {
          '@src': './src',
          '@config': './src/config',
          '@assets': './src/assets',
          '@core': './src/core',
          '@domain': './src/domain',
          '@infrastructure': './src/infrastructure',
          '@presentation': './src/presentation',
        },
      },
    ],
  ],
};
