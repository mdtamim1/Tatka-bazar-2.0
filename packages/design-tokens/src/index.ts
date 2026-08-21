// =============================================================================
// Tatka Bazar — Design Tokens
// Single source of truth for all brand fundamentals.
// =============================================================================

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------
export const colors = {
  // Brand
  brand: {
    primary:   "#1B8A4C", // Forest green — trust, freshness
    primary50: "#F0FBF5",
    primary100:"#D1F5E2",
    primary200:"#A3EBC5",
    primary300:"#66D9A0",
    primary400:"#33C278",
    primary500:"#1B8A4C",
    primary600:"#166E3D",
    primary700:"#0E5230",
    primary800:"#08381F",
    primary900:"#031E11",

    accent:    "#F47920", // Vibrant orange — energy, appetite
    accent50:  "#FFF8F0",
    accent100: "#FDECD6",
    accent200: "#FACCAA",
    accent300: "#F7A769",
    accent400: "#F58D3F",
    accent500: "#F47920",
    accent600: "#D46218",
    accent700: "#A84B12",
    accent800: "#7D360C",
    accent900: "#521F06",
  },

  // Neutral
  neutral: {
    0:   "#FFFFFF",
    50:  "#F9FAFB",
    100: "#F3F4F6",
    150: "#EAECF0",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
    950: "#030712",
  },

  // Semantic
  success: "#16A34A",
  warning: "#D97706",
  danger:  "#DC2626",
  info:    "#2563EB",
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const typography = {
  fontFamily: {
    sans:  "'Inter', 'Hind Siliguri', system-ui, -apple-system, sans-serif",
    mono:  "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs:   "0.75rem",   // 12px
    sm:   "0.875rem",  // 14px
    base: "1rem",      // 16px
    lg:   "1.125rem",  // 18px
    xl:   "1.25rem",   // 20px
    "2xl":"1.5rem",    // 24px
    "3xl":"1.875rem",  // 30px
    "4xl":"2.25rem",   // 36px
    "5xl":"3rem",      // 48px
    "6xl":"3.75rem",   // 60px
  },
  fontWeight: {
    regular:   "400",
    medium:    "500",
    semibold:  "600",
    bold:      "700",
    extrabold: "800",
  },
  lineHeight: {
    none:    "1",
    tight:   "1.25",
    snug:    "1.375",
    normal:  "1.5",
    relaxed: "1.625",
    loose:   "2",
  },
  letterSpacing: {
    tight:  "-0.025em",
    normal: "0em",
    wide:   "0.025em",
    wider:  "0.05em",
    widest: "0.1em",
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing Scale (4px base)
// ---------------------------------------------------------------------------
export const spacing = {
  0:   "0px",
  px:  "1px",
  0.5: "2px",
  1:   "4px",
  1.5: "6px",
  2:   "8px",
  2.5: "10px",
  3:   "12px",
  3.5: "14px",
  4:   "16px",
  5:   "20px",
  6:   "24px",
  7:   "28px",
  8:   "32px",
  9:   "36px",
  10:  "40px",
  12:  "48px",
  14:  "56px",
  16:  "64px",
  20:  "80px",
  24:  "96px",
  28:  "112px",
  32:  "128px",
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------
export const radius = {
  none: "0px",
  sm:   "4px",
  md:   "8px",
  lg:   "12px",
  xl:   "16px",
  "2xl":"20px",
  "3xl":"24px",
  full: "9999px",
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------
export const shadows = {
  sm:  "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md:  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg:  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl:  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl":"0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner:"inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  glow: "0 0 20px rgb(27 138 76 / 0.35)",
} as const;

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------
export const transitions = {
  fast:   "150ms ease",
  normal: "250ms ease",
  slow:   "400ms ease",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ---------------------------------------------------------------------------
// Z-Index
// ---------------------------------------------------------------------------
export const zIndex = {
  base:    0,
  raised:  10,
  dropdown:100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
  tooltip: 600,
} as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------
export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl":"1536px",
} as const;

// All tokens as one object for convenience
export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
} as const;

export type Tokens = typeof tokens;
export default tokens;
