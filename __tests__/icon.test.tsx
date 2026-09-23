import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  FavoriteButton,
  ICONS,
  Icon,
  type IconName,
} from '@presentation/components';
import { palettes } from '@presentation/theme';

const render = async (element: React.ReactElement) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(element);
  });
  return renderer;
};

/** The lucide component Icon rendered (the node that received its props). */
const glyph = (renderer: ReactTestRenderer.ReactTestRenderer, name: string) =>
  renderer.root.find(
    node =>
      node.props.testID === `icon-${name}` && typeof node.type !== 'string',
  );

describe('Icon', () => {
  it.each(Object.keys(ICONS) as IconName[])('renders %s', async name => {
    const renderer = await render(<Icon name={name} />);
    expect(glyph(renderer, name)).toBeDefined();
  });

  it('colors by theme token and fills only when asked', async () => {
    const renderer = await render(<Icon name="heart" color="accent" />);
    const node = glyph(renderer, 'heart');
    expect(node.props.color).toBe(palettes.light.accent);
    expect(node.props.fill).toBe('none');
  });
});

describe('FavoriteButton', () => {
  it('fills the heart only when the activity is a favorite', async () => {
    const renderer = await render(
      <FavoriteButton
        isFavorite={false}
        onPress={() => {}}
        accessibilityLabel="Save"
      />,
    );
    expect(glyph(renderer, 'heart').props.fill).toBe('none');

    await ReactTestRenderer.act(async () => {
      renderer.update(
        <FavoriteButton
          isFavorite
          onPress={() => {}}
          accessibilityLabel="Save"
        />,
      );
    });
    expect(glyph(renderer, 'heart').props.fill).toBe(palettes.light.accent);
  });
});
