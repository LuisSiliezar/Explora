/** Scroll offsets where page `i` is one page left, centred, one page right. */
export const pageRange = (i: number, width: number) => {
  'worklet';
  return [(i - 1) * width, i * width, (i + 1) * width];
};
