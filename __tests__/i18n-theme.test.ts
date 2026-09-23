import { strings, translate } from '@presentation/i18n/strings';
import palette from '@presentation/theme/palette';

describe('strings', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(strings.es).sort()).toEqual(
      Object.keys(strings.en).sort(),
    );
  });

  it('has no empty copy', () => {
    for (const dictionary of Object.values(strings)) {
      for (const value of Object.values(dictionary)) {
        expect(value.trim()).not.toBe('');
      }
    }
  });

  it('substitutes placeholders', () => {
    expect(translate('en', 'toastSaved', { s: 'Sunset Walk' })).toBe(
      'Saved “Sunset Walk” — offline ready',
    );
    expect(translate('es', 'showResults', { n: 4 })).toBe('Ver 4');
  });
});

describe('theme', () => {
  // jest runs from the project root; typed inline to avoid pulling in @types/node.
  const fs = jest.requireActual<{
    readFileSync: (file: string, encoding: 'utf8') => string;
  }>('fs');
  const css = fs.readFileSync('global.css', 'utf8');
  const rgb = (hex: string) =>
    [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');

  it('global.css mirrors every palette token (light and dark)', () => {
    const [lightBlock, darkBlock] = css.split(
      '@media (prefers-color-scheme: dark)',
    );
    for (const [key, hex] of Object.entries(palette.light)) {
      expect(lightBlock).toContain(`--${palette.toKebab(key)}: ${rgb(hex)};`);
    }
    for (const [key, hex] of Object.entries(palette.dark)) {
      expect(darkBlock).toContain(`--${palette.toKebab(key)}: ${rgb(hex)};`);
    }
  });

  it('light and dark define the same tokens', () => {
    expect(Object.keys(palette.dark)).toEqual(Object.keys(palette.light));
  });
});
