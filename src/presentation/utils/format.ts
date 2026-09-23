/** 0.24 → "240 m", 1.34 → "1.3 km". */
export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

/** "21 Sep, 08:12" in the given locale; `never` when there is no timestamp. */
export const formatSyncTime = (
  timestamp: number,
  locale: string,
  never: string,
): string => {
  if (!timestamp) {
    return never;
  }
  const date = new Date(timestamp);
  const day = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${day}, ${time}`;
};
