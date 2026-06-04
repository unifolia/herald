const darkColors = {
  primary: "#ff8d28",
  primaryLight: "#d8a442",
  primaryMuted: "#2f5f7f",
  secondary: "#d63f78",

  background: "#151211",
  surfaceDark: "#24180f",
  surfaceGlass: "rgba(92, 61, 33, 0.28)",
  surfaceGlassBorder: "rgba(216, 164, 66, 0.28)",
  surfaceSubtle: "rgba(243, 231, 197, 0.035)",
  surfaceInput: "rgba(243, 231, 197, 0.055)",
  surfacePopover: "rgba(36, 24, 15, 0.96)",
  surfaceHover: "rgba(143, 29, 44, 0.05)",
  surfaceHoverStrong: "rgba(143, 29, 44, 0.08)",

  primaryAlpha5: "rgba(143, 29, 44, 0.05)",
  primaryAlpha8: "rgba(143, 29, 44, 0.08)",
  primaryAlpha20: "rgba(143, 29, 44, 0.2)",
  primaryAlpha30: "rgba(143, 29, 44, 0.3)",

  textPrimary: "#f3e7c5",
  textSecondary: "#cdbb8f",

  danger: "#c4492d",
  dangerAlpha10: "rgba(196, 73, 45, 0.1)",
  dangerAlpha30: "rgba(196, 73, 45, 0.3)",

  titleHover: "#ff8d28",
  removeHover: "#c4492d",

  black: "#070503",
  insetHighlight: "rgba(243, 231, 197, 0.1)",
  insetHighlightStrong: "rgba(243, 231, 197, 0.15)",
};

const lightColors: typeof darkColors = {
  primary: "#a93624",
  primaryLight: "#b98a24",
  primaryMuted: "#294f77",
  secondary: "#3fd662",

  background: "#f9f0dd",
  surfaceDark: "#fff7e2",
  surfaceGlass: "rgba(255, 247, 224, 0.74)",
  surfaceGlassBorder: "rgba(125, 82, 38, 0.28)",
  surfaceSubtle: "rgba(255, 250, 235, 0.5)",
  surfaceInput: "rgba(255, 250, 235, 0.8)",
  surfacePopover: "rgba(255, 248, 229, 0.98)",
  surfaceHover: "rgba(252, 242, 216, 0.86)",
  surfaceHoverStrong: "rgba(249, 235, 203, 0.88)",

  primaryAlpha5: "rgba(169, 54, 36, 0.06)",
  primaryAlpha8: "rgba(255, 240, 230, 0.7)",
  primaryAlpha20: "rgba(169, 54, 36, 0.2)",
  primaryAlpha30: "rgba(169, 54, 36, 0.32)",

  textPrimary: "#2f2418",
  textSecondary: "#281d0c",

  danger: "#8f2f24",
  dangerAlpha10: "rgba(143, 47, 36, 0.1)",
  dangerAlpha30: "rgba(143, 47, 36, 0.3)",

  titleHover: "#17120b", // editable-title hover ink (= near-black)
  removeHover: "#17120b", // remove-X hover ink (= near-black)

  black: "#17120b",
  insetHighlight: "rgba(255, 255, 245, 0.48)",
  insetHighlightStrong: "rgba(255, 255, 245, 0.68)",
};

const darkGradients = {
  rangeTrack:
    "linear-gradient(270deg, rgba(255, 131, 147, 0.66), rgba(240, 201, 127, 0.66), rgba(161, 217, 255, 0.66))",
  rangeThumb: "linear-gradient(135deg, var(--primary), var(--primary-light))",
  textGradient:
    "linear-gradient(135deg, var(--secondary), var(--primary-light), var(--primary-muted))",
};

const lightGradients: typeof darkGradients = {
  rangeTrack:
    "linear-gradient(270deg, rgba(169, 54, 36, 0.66), rgba(185, 138, 36, 0.66), rgba(41, 79, 119, 0.66))",
  rangeThumb: darkGradients.rangeThumb,
  textGradient:
    "linear-gradient(135deg, var(--primary), var(--primary-light), var(--primary-muted))",
};

const darkShadows = {
  glass:
    "0 8px 32px rgba(7, 5, 3, 0.36), inset 0 1px 0 rgba(243, 231, 197, 0.1)",
  glassHover:
    "0 12px 40px rgba(7, 5, 3, 0.48), inset 0 1px 0 rgba(243, 231, 197, 0.15)",
  button: "0 8px 25px rgba(7, 5, 3, 0.34)",
  textGlow: "none",
  rangeThumb: "0 4px 8px rgba(7, 5, 3, 0.34)",
  rangeThumbHover: "0 6px 12px rgba(7, 5, 3, 0.44)",
  nav: "0 4px 20px rgba(7, 5, 3, 0.28), inset 0 1px 0 rgba(243, 231, 197, 0.1)",
};

const lightShadows: typeof darkShadows = {
  glass:
    "0 8px 28px rgba(92, 58, 22, 0.16), inset 0 1px 0 rgba(255, 255, 245, 0.55)",
  glassHover:
    "0 12px 34px rgba(92, 58, 22, 0.22), inset 0 1px 0 rgba(255, 255, 245, 0.72)",
  button: "0 8px 22px rgba(92, 58, 22, 0.18)",
  textGlow: "none",
  rangeThumb: "0 4px 8px rgba(92, 58, 22, 0.22)",
  rangeThumbHover: "0 6px 12px rgba(92, 58, 22, 0.3)",
  nav: "0 4px 18px rgba(92, 58, 22, 0.15), inset 0 1px 0 rgba(255, 255, 245, 0.6)",
};

export const theme = {
  colorSchemes: {
    dark: {
      colorScheme: "dark",
      colors: darkColors,
      gradients: darkGradients,
      shadows: darkShadows,
      selectCaret:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23cdbb8f' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    },
    light: {
      colorScheme: "light",
      colors: lightColors,
      gradients: lightGradients,
      shadows: lightShadows,
      selectCaret:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236d5735' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    },
  },
  colors: darkColors,
  gradients: darkGradients,
  fonts: {
    family:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    sizes: {
      h1: "6em",
      h2: "2rem",
      form: "1rem",
      body: "0.95rem",
      label: "0.9rem",
    },
    weights: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  transitions: {
    default: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  shadows: darkShadows,
  breakpoints: {
    narrow: "700px",
    rowStack: "1080px",
    big: "1440px",
    huge: "1900px",
  },
} as const;

export type Theme = typeof theme;
