/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryClient } from '@tanstack/react-query';
import type { Dependencies } from '@config/di';
import { AppProviders } from '@presentation/providers';
import { AppRoot } from '@presentation/routes';
import { createFakeContainer } from './helpers/fakes';

const render = async (dependencies: Dependencies) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppProviders dependencies={dependencies} queryClient={queryClient}>
        <AppRoot />
      </AppProviders>,
    );
  });
  const cleanup = async () => {
    await ReactTestRenderer.act(async () => renderer.unmount());
    queryClient.clear();
  };
  return { renderer, cleanup };
};

/** Presses the first element whose accessibilityLabel matches. */
const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const [target] = renderer.root.findAll(
    node => node.props.accessibilityLabel === label && !!node.props.onPress,
  );
  expect(target).toBeDefined();
  await ReactTestRenderer.act(async () => target.props.onPress());
};

const hasTab = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findAll(node => node.props.accessibilityRole === 'tab').length >
  0;

test('first launch: onboarding → skip lands on the tabs', async () => {
  const dependencies = createFakeContainer();
  dependencies.settingsStore.getState().setLanguage('en');
  const { renderer, cleanup } = await render(dependencies);
  expect(hasTab(renderer)).toBe(false);

  await press(renderer, 'Skip');

  expect(dependencies.settingsStore.getState().onboardingDone).toBe(true);
  expect(hasTab(renderer)).toBe(true);
  await cleanup();
});

test('first launch: stepping through onboarding → get started lands on the tabs', async () => {
  const dependencies = createFakeContainer();
  dependencies.settingsStore.getState().setLanguage('en');
  const { renderer, cleanup } = await render(dependencies);

  await press(renderer, 'Next');
  await press(renderer, 'Next');
  await press(renderer, 'Get started');

  expect(dependencies.settingsStore.getState().onboardingDone).toBe(true);
  expect(hasTab(renderer)).toBe(true);
  await cleanup();
});

test('renders the tabs once onboarding is done', async () => {
  const dependencies = createFakeContainer();
  dependencies.settingsStore.getState().completeOnboarding();
  const { renderer, cleanup } = await render(dependencies);
  expect(hasTab(renderer)).toBe(true);
  await cleanup();
});
