import type { DevSettingsState } from '@core/store';
import { useDependencies } from '@presentation/providers/DependenciesProvider';

/** Selector-based access to the dev/staging switches (network simulation). */
export const useDevSettings = <T>(
  selector: (state: DevSettingsState) => T,
): T => {
  const { devSettingsStore } = useDependencies();
  return devSettingsStore(selector);
};
