/** Tactile feedback. Implementations must never throw: haptics are a nice-to-have. */
export interface HapticsPort {
  /** Light tick for selections: chips, toggles, tabs. */
  selection(): void;
  /** Something was saved or completed. */
  success(): void;
  /** Something was blocked or failed. */
  warning(): void;
}
