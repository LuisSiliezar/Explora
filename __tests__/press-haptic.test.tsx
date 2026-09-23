import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DependenciesProvider } from '@presentation/providers/DependenciesProvider';
import {
  usePressHaptic,
  type PressHaptic,
} from '@presentation/hooks/usePressHaptic';
import { createFakeContainer } from './helpers/fakes';

type Handler = (value: number) => void;

/** Renders the hook and exposes the latest returned callback. */
const setup = (kind: PressHaptic, handler: Handler) => {
  const deps = createFakeContainer();
  const results: Handler[] = [];
  const Probe = (props: { kind: PressHaptic; handler: Handler }) => {
    results.push(usePressHaptic(props.kind, props.handler));
    return null;
  };
  const tree = (props: { kind: PressHaptic; handler: Handler }) => (
    <DependenciesProvider value={deps}>
      <Probe {...props} />
    </DependenciesProvider>
  );
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(tree({ kind, handler }));
  });
  const rerender = (props: { kind: PressHaptic; handler: Handler }) =>
    ReactTestRenderer.act(() => renderer.update(tree(props)));
  return { deps, results, rerender };
};

describe('usePressHaptic', () => {
  it('fires the haptic, then calls the handler with its arguments', () => {
    const handler = jest.fn();
    const { deps, results } = setup('selection', handler);
    results[results.length - 1](7);
    expect(deps.haptics.selection).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(7);
  });

  it('fires nothing for "none"', () => {
    const handler = jest.fn();
    const { deps, results } = setup('none', handler);
    results[results.length - 1](1);
    expect(deps.haptics.selection).not.toHaveBeenCalled();
    expect(deps.haptics.success).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('keeps a stable callback that uses the latest kind and handler', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { deps, results, rerender } = setup('selection', first);
    rerender({ kind: 'success', handler: second });
    expect(results[results.length - 1]).toBe(results[0]);
    results[0](2);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(2);
    expect(deps.haptics.success).toHaveBeenCalledTimes(1);
  });
});
