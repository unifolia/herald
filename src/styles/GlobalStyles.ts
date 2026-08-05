import styled, { createGlobalStyle } from "styled-components";
import { theme } from "./theme";
import type { ColorScheme } from "../types";

const schemeVariables = (
  scheme: (typeof theme.colorSchemes)[keyof typeof theme.colorSchemes],
) => `
  color-scheme: ${scheme.colorScheme};
  --primary: ${scheme.colors.primary};
  --primary-light: ${scheme.colors.primaryLight};
  --primary-muted: ${scheme.colors.primaryMuted};
  --surface-dark: ${scheme.colors.surfaceDark};
  --surface-glass: ${scheme.colors.surfaceGlass};
  --surface-glass-border: ${scheme.colors.surfaceGlassBorder};
  --surface-subtle: ${scheme.colors.surfaceSubtle};
  --surface-input: ${scheme.colors.surfaceInput};
  --surface-popover: ${scheme.colors.surfacePopover};
  --surface-hover: ${scheme.colors.surfaceHover};
  --surface-hover-strong: ${scheme.colors.surfaceHoverStrong};
  --text-primary: ${scheme.colors.textPrimary};
  --text-secondary: ${scheme.colors.textSecondary};
  --danger: ${scheme.colors.danger};
  --danger-alpha-10: ${scheme.colors.dangerAlpha10};
  --danger-alpha-30: ${scheme.colors.dangerAlpha30};
  --title-hover: ${scheme.colors.titleHover};
  --remove-hover: ${scheme.colors.removeHover};
  --background: ${scheme.colors.background};
  --primary-alpha-5: ${scheme.colors.primaryAlpha5};
  --primary-alpha-8: ${scheme.colors.primaryAlpha8};
  --primary-alpha-20: ${scheme.colors.primaryAlpha20};
  --primary-alpha-30: ${scheme.colors.primaryAlpha30};
  --inset-highlight: ${scheme.colors.insetHighlight};
  --inset-highlight-strong: ${scheme.colors.insetHighlightStrong};
  --range-track: ${scheme.gradients.rangeTrack};
  --range-thumb: ${scheme.gradients.rangeThumb};
  --text-gradient: ${scheme.gradients.textGradient};
  --shadow-glass: ${scheme.shadows.glass};
  --shadow-glass-hover: ${scheme.shadows.glassHover};
  --shadow-button: ${scheme.shadows.button};
  --shadow-text-glow: ${scheme.shadows.textGlow};
  --shadow-range-thumb: ${scheme.shadows.rangeThumb};
  --shadow-range-thumb-hover: ${scheme.shadows.rangeThumbHover};
  --shadow-nav: ${scheme.shadows.nav};
  --select-caret: ${scheme.selectCaret};
  --secondary: ${scheme.colors.secondary};
`;

interface GlobalStyleProps {
  $colorScheme: ColorScheme;
}

export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
  :root {
    ${({ $colorScheme }) => schemeVariables(theme.colorSchemes[$colorScheme])}
    line-height: 1.4;
    font-weight: 300;
    color: var(--text-primary);
    accent-color: var(--primary);

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: var(--background);
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 380px;
    min-height: 100vh;
    font-family: ${theme.fonts.family};
    overflow-x: hidden;
  }

  #app {
    max-width: 1280px;
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    margin: 0 auto;
    padding: ${theme.spacing.xl};
    text-align: center;
    display: flex;
    flex-direction: column;
    @media (min-width: ${theme.breakpoints.big}) {
      max-width: 1400px;
    }
    @media (min-width: ${theme.breakpoints.huge}) {
      max-width: 1850px;
    }
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  footer {
    margin-top: 25px;
  }

  a,
  a:visited {
    color: var(--text-primary);
  }

  #mothership {
    color: var(--text-primary);
    text-decoration: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export const Title = styled.h1`
  font-size: ${theme.fonts.sizes.h1};
  line-height: 1.1;
  color: var(--text-primary);
  text-transform: lowercase;
  font-weight: ${theme.fonts.weights.thin};
  letter-spacing: 0.05em;
  background: var(--text-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: var(--shadow-text-glow);
  width: fit-content;
  margin: 0 auto ${theme.spacing.md};

  &::selection {
    background: var(--primary-alpha-30);
    color: var(--text-primary);
    -webkit-text-fill-color: var(--text-primary);
  }
`;

export const BaseButton = styled.button`
  border-radius: ${theme.borderRadius.md};
  border: 1px solid var(--surface-glass-border);
  padding: 0.8rem 1.5rem;
  font-size: ${theme.fonts.sizes.body};
  font-weight: ${theme.fonts.weights.normal};
  font-family: inherit;
  color: var(--text-primary);
  cursor: pointer;
  transition: ${theme.transitions.default};
  text-transform: lowercase;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: var(--surface-input);

  &:hover {
    border-color: var(--primary);
    background: var(--surface-hover-strong);
    box-shadow: var(--shadow-button);
    color: var(--text-primary);
  }
`;

export const Label = styled.label`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;
