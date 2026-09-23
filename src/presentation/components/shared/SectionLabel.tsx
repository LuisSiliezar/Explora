import React from 'react';
import { Text } from './Text';

/** The design's mono, spaced, uppercase caption ("CATEGORY", "LOCATION"...). */
export const SectionLabel = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text
    className={`font-mono text-[10px] tracking-[0.8px] text-text-muted ${className}`}
  >
    {children}
  </Text>
);
