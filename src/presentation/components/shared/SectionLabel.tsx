import React from 'react';
import { Text } from './Text';

/** The design's small, spaced, uppercase caption ("CATEGORY", "LOCATION"...). */
export const SectionLabel = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text
    className={`font-sans-medium text-xs tracking-widest text-text-muted ${className}`}
  >
    {children}
  </Text>
);
