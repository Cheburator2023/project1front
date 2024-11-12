import { DARK_THEME, LIGHT_THEME } from '@admiral-ds/react-ui';

export type Color = {
  // <editor-fold desc="Foundation">
  'Foundation/Blue/B50': string;
};

export const COLOR: Color = {
  'Foundation/Blue/B50': '#E7F5FF',
};

LIGHT_THEME.color = Object.assign(LIGHT_THEME.color, COLOR);
DARK_THEME.color = Object.assign(LIGHT_THEME.color, COLOR);

export const themes = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

