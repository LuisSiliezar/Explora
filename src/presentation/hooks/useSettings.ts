import type { AppSettingsState } from '@core/store';
import { useDependencies } from '@presentation/providers/DependenciesProvider';

/** Selector-based access to persisted app settings (re-renders only on the selected slice). */
export const useSettings = <T>(selector: (state: AppSettingsState) => T): T => {
  const { settingsStore } = useDependencies();
  return settingsStore(selector);
};
