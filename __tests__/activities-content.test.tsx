import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DomainError } from '@domain/errors';
import { strings } from '@presentation/i18n';
import { DependenciesProvider } from '@presentation/providers/DependenciesProvider';
import { ActivitiesContent } from '@presentation/screens/activities/components/ActivitiesContent';
import { createFakeContainer } from './helpers/fakes';

const en = strings.en;

const render = ({
  isPending = false,
  error = null as unknown,
  hasData = true,
}) => {
  const deps = createFakeContainer();
  deps.settingsStore.getState().setLanguage('en');
  const onRetry = jest.fn();
  const onClearFilters = jest.fn();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <DependenciesProvider value={deps}>
        <ActivitiesContent
          isPending={isPending}
          error={error}
          hasData={hasData}
          dataUpdatedAt={0}
          onRetry={onRetry}
          onGoFavorites={jest.fn()}
          rows={[]}
          sortKey="name"
          onPressItem={jest.fn()}
          onToggleFavorite={jest.fn()}
          refreshing={false}
          onRefresh={jest.fn()}
          onClearFilters={onClearFilters}
        />
      </DependenciesProvider>,
    );
  });
  /** What a screen reader gets: host nodes with a role, and their label or text. */
  const withRole = (role: string) =>
    tree.root.findAll(
      node =>
        typeof node.type === 'string' && node.props.accessibilityRole === role,
    );
  const press = (label: string) =>
    ReactTestRenderer.act(() => {
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress();
    });
  const text = () =>
    tree.root
      .findAll(node => typeof node.props.children === 'string')
      .map(node => node.props.children as string);
  return { withRole, press, text, onRetry, onClearFilters };
};

describe('ActivitiesContent states (S5)', () => {
  it('loading: shows a skeleton that a screen reader reads as "Loading"', () => {
    const view = render({ isPending: true });
    const progress = view.withRole('progressbar');
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0].props.accessibilityLabel).toBe(en.loading);
  });

  it('error with no catalog: a header title and a Retry that recovers', () => {
    const view = render({
      error: new DomainError('NETWORK', 'GET activities failed'),
      hasData: false,
    });
    expect(view.withRole('header').length).toBeGreaterThan(0);
    expect(view.text()).toContain(en.errorTitle);
    view.press(en.retry);
    expect(view.onRetry).toHaveBeenCalledTimes(1);
  });

  it('error while a catalog is cached: keeps the list instead of an error', () => {
    const view = render({
      error: new DomainError('NETWORK', 'GET activities failed'),
      hasData: true,
    });
    expect(view.text()).not.toContain(en.errorTitle);
  });

  it('no matches: an empty state whose action clears the filters', () => {
    const view = render({});
    expect(view.text()).toContain(en.emptyNoMatch);
    view.press(en.clearFilters);
    expect(view.onClearFilters).toHaveBeenCalledTimes(1);
  });
});
