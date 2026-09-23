import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import type { Dependencies } from '@config/di';

const DependenciesContext = createContext<Dependencies | null>(null);

export const DependenciesProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: Dependencies }>) => (
  <DependenciesContext.Provider value={value}>
    {children}
  </DependenciesContext.Provider>
);

export const useDependencies = (): Dependencies => {
  const deps = useContext(DependenciesContext);
  if (!deps) {
    throw new Error(
      'useDependencies must be used inside <DependenciesProvider>',
    );
  }
  return deps;
};
