export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight: (fontSize: number) => Math.round(fontSize * 1.2),
    normal: (fontSize: number) => Math.round(fontSize * 1.4),
    relaxed: (fontSize: number) => Math.round(fontSize * 1.6),
  },

  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: Math.round(32 * 1.2),
  },
  heading2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: Math.round(28 * 1.2),
  },
  heading3: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: Math.round(24 * 1.2),
  },
  heading4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: Math.round(20 * 1.3),
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: Math.round(16 * 1.4),
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: Math.round(14 * 1.4),
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: Math.round(12 * 1.3),
  },
};
