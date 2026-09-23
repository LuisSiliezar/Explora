type Palette = Record<
  | 'background'
  | 'canvas'
  | 'field'
  | 'raised'
  | 'skeleton'
  | 'skeletonHighlight'
  | 'text'
  | 'textMuted'
  | 'textFaint'
  | 'border'
  | 'primary'
  | 'primaryPressed'
  | 'onPrimary'
  | 'accent'
  | 'success'
  | 'successBorder'
  | 'danger'
  | 'dangerSurface'
  | 'dangerBorder'
  | 'inverse'
  | 'onInverse'
  | 'warning'
  | 'toast'
  | 'onToast'
  | 'toastBorder'
  | 'tagSurface'
  | 'outdoorsBg'
  | 'outdoorsFg'
  | 'cultureBg'
  | 'cultureFg'
  | 'workshopsBg'
  | 'workshopsFg'
  | 'leisureBg'
  | 'leisureFg',
  string
>;

declare const palette: {
  light: Palette;
  dark: Palette;
  toKebab: (key: string) => string;
};

export = palette;
