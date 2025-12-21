// Typography theme matching web version (Inter font)
// Using system fonts that match Inter's characteristics
export const typography = {
  fontFamily: {
    // System fonts that closely match Inter
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    // Platform-specific fallbacks
    ios: 'System',
    android: 'sans-serif',
  },
  
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
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

