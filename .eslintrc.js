module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Diagnostics go through LoggerPort (deps.logger), never console directly.
    'no-console': 'error',
  },
  overrides: [
    {
      files: ['jest.setup.js', '__tests__/**/*'],
      env: { jest: true },
    },
    {
      files: ['src/infrastructure/services/console-logger.service.ts'],
      rules: { 'no-console': 'off' },
    },
  ],
};
