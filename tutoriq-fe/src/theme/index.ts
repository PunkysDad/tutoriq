import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';
import { commonStyles, getProgressColor, getProgressLevel } from './commonStyles';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

export { commonStyles, getProgressColor, getProgressLevel };
