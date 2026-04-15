// ============================================================
// PAR-KIDS — Design System Tokens
// Shared across web (CSS variables) and mobile (StyleSheet)
// ============================================================

export const colors = {
  // Primary Brand
  green: {
    50: '#F0FBF4',
    100: '#D4F0DE',
    200: '#A8E0BC',
    300: '#6CC79A',
    400: '#3DAD77',
    500: '#2D7D5A', // PRIMARY
    600: '#236346',
    700: '#1A4A34',
    800: '#113122',
    900: '#091911',
  },

  // Teal (Connection)
  teal: {
    50: '#F0FAFA',
    100: '#CCEEEE',
    200: '#99DDDD',
    300: '#66CCCC',
    400: '#3ABFBF', // ACCENT
    500: '#2EA5A5',
    600: '#237F7F',
    700: '#195F5F',
    800: '#103F3F',
    900: '#082020',
  },

  // Amber (Celebration/Energy)
  amber: {
    50: '#FFFBF0',
    100: '#FEF3CC',
    200: '#FDE299',
    300: '#FCCB66',
    400: '#F4A535', // ACCENT
    500: '#E08B20',
    600: '#B86F18',
    700: '#8A5311',
    800: '#5C380A',
    900: '#2E1C05',
  },

  // Neutrals
  sand: {
    50: '#FDFAF6',
    100: '#FDF6EC', // WARM WHITE
    200: '#F5EDD8',
    300: '#EAD9B5',
    400: '#D4B88A',
    500: '#B8935F',
    600: '#9A7548',
    700: '#7A5A35',
    800: '#5A4025',
    900: '#3A2815',
  },

  charcoal: {
    50: '#F4F6F6',
    100: '#E2E8E8',
    200: '#C4D0D1',
    300: '#9AADAD',
    400: '#6B8485',
    500: '#486668',
    600: '#374E50',
    700: '#28393B', // BODY TEXT
    800: '#1E2D2F', // HEADINGS
    900: '#141F20',
  },

  // Functional
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Semantic
  success: '#2D7D5A',
  warning: '#F4A535',
  error: '#E05252',
  info: '#3ABFBF',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#1E2D2F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E2D2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1E2D2F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Typography Families
export const fonts = {
  // Display/Headlines — DM Serif Display (warm, editorial)
  display: 'DMSerifDisplay-Regular',
  // Body — DM Sans (clean, legible)
  body: 'DMSans-Regular',
  bodyMedium: 'DMSans-Medium',
  bodySemibold: 'DMSans-SemiBold',
  bodyBold: 'DMSans-Bold',
  // Child UI — Nunito (rounded, friendly)
  child: 'Nunito-Regular',
  childBold: 'Nunito-Bold',
} as const;

// Mood Colors
export const moodColors: Record<number, string> = {
  1: '#E05252', // Very low — soft red
  2: '#F4A535', // Low — amber
  3: '#F4D03F', // Neutral — yellow
  4: '#6CC79A', // Good — green
  5: '#3ABFBF', // Great — teal
};

// Mood Emojis
export const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😟',
  3: '😐',
  4: '😊',
  5: '😄',
};

// Goal Category Colors
export const goalCategoryColors: Record<string, string> = {
  academic: '#3ABFBF',
  social: '#F4A535',
  personal: '#2D7D5A',
  family: '#9B7FD4',
  health: '#E05252',
  creative: '#F4D03F',
};

// Age Group Configuration
export const ageGroupConfig = {
  early: {
    label: 'Ages 6–10',
    fontFamily: 'child',
    primaryColor: colors.teal[400],
    questionStyle: 'emoji_first',
    maxQuestionsPerScreen: 2,
  },
  preteen: {
    label: 'Ages 11–13',
    fontFamily: 'body',
    primaryColor: colors.green[500],
    questionStyle: 'visual_with_text',
    maxQuestionsPerScreen: 3,
  },
  teen: {
    label: 'Ages 14–17',
    fontFamily: 'body',
    primaryColor: colors.charcoal[800],
    questionStyle: 'text_primary',
    maxQuestionsPerScreen: 4,
  },
} as const;
