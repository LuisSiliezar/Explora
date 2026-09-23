import { useCallback } from 'react';
import { useSettings } from '@presentation/hooks/useSettings';
import { translate, type StringKey } from './strings';

export type Translate = (
  key: StringKey,
  vars?: { s?: string; n?: number },
) => string;

/** Returns a stable `t(key, vars)` for the current app language. */
export const useT = (): Translate => {
  const language = useSettings(state => state.language);
  return useCallback((key, vars) => translate(language, key, vars), [language]);
};
