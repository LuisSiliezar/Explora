import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DomainError } from '@domain/errors';
import { strings } from '@presentation/i18n';
import { DependenciesProvider } from '@presentation/providers/DependenciesProvider';
import { DetailFallback } from '@presentation/screens/activity-detail/components/DetailFallback';
import { createFakeContainer } from './helpers/fakes';

const en = strings.en;

const render = (error: unknown) => {
  const deps = createFakeContainer();
  deps.settingsStore.getState().setLanguage('en');
  const onBack = jest.fn();
  const onRetry = jest.fn();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <DependenciesProvider value={deps}>
        <DetailFallback
          loading={false}
          error={error}
          onBack={onBack}
          onRetry={onRetry}
        />
      </DependenciesProvider>,
    );
  });
  const texts = tree.root
    .findAll(node => typeof node.props.children === 'string')
    .map(node => node.props.children as string);
  const buttons = (label: string) =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    );
  const pressButton = (label: string) =>
    ReactTestRenderer.act(() => {
      buttons(label).forEach(node => node.props.onPress());
    });
  return {
    texts,
    buttons,
    pressButton,
    onBack,
    onRetry,
    unmount: () => ReactTestRenderer.act(() => tree.unmount()),
  };
};

describe('DetailFallback', () => {
  it('an unknown id (bad deep link) says not found and only offers back', () => {
    const view = render(new DomainError('NOT_FOUND', 'Activity x not found'));
    expect(view.texts).toContain(en.activityNotFoundTitle);
    expect(view.texts).not.toContain(en.errorBody);
    expect(view.buttons(en.retry)).toHaveLength(0);
    view.pressButton(en.back);
    expect(view.onBack).toHaveBeenCalled();
    expect(view.onRetry).not.toHaveBeenCalled();
    view.unmount();
  });

  it('a network error keeps the retry', () => {
    const view = render(new DomainError('NETWORK', 'down'));
    expect(view.texts).toContain(en.activityUnavailable);
    expect(view.texts).toContain(en.errorBody);
    view.pressButton(en.retry);
    expect(view.onRetry).toHaveBeenCalled();
    view.unmount();
  });
});
