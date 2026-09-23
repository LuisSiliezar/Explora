/**
 * Conventional Commits: `type(scope): summary`.
 * Scopes are features, layers or platforms. Add a scope here before using it.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // features
        'activities',
        'detail',
        'favorites',
        'reminders',
        'camera',
        'near-me',
        'auth',
        'onboarding',
        'settings',
        'i18n',
        'theme',
        'splash',
        // layers
        'domain',
        'core',
        'infra',
        'ui',
        'di',
        'env',
        // platforms and tooling
        'ios',
        'android',
        'deps',
        'adr',
      ],
    ],
  },
};
