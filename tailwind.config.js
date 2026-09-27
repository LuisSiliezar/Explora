const { light, toKebab } = require('./src/presentation/theme/palette');

/** Every palette token becomes a class (bg-primary, text-text-muted, border-border...) backed by a CSS variable. */
const colors = Object.fromEntries(
  Object.keys(light).map(key => [
    toKebab(key),
    `rgb(var(--${toKebab(key)}) / <alpha-value>)`,
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      // Android can't pick a weight from one family: one family per weight.
      fontFamily: {
        sans: ['DMSans-Regular'],
        'sans-medium': ['DMSans-Medium'],
        'sans-semibold': ['DMSans-SemiBold'],
        'sans-bold': ['DMSans-Bold'],
        display: ['PlusJakartaSans-Regular'],
        'display-medium': ['PlusJakartaSans-Medium'],
        'display-semibold': ['PlusJakartaSans-SemiBold'],
        'display-bold': ['PlusJakartaSans-Bold'],
      },
    },
  },
  plugins: [],
};
