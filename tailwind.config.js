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
        sans: ['Figtree-Regular'],
        'sans-medium': ['Figtree-Medium'],
        'sans-semibold': ['Figtree-SemiBold'],
        'sans-bold': ['Figtree-Bold'],
        mono: ['IBMPlexMono-Regular'],
        'mono-medium': ['IBMPlexMono-Medium'],
      },
    },
  },
  plugins: [],
};
