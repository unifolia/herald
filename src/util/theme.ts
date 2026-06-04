import type { ColorScheme } from "../types";

const DARK_DEFAULT_BG = "#516f57";
const LIGHT_DEFAULT_BG = "#ffd09e";
const THEME_STORAGE_KEY = "midi-herald-color-scheme";

const isColorScheme = (value: string | null): value is ColorScheme =>
  value === "dark" || value === "light";

const getSystemColorScheme = (): ColorScheme => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

export const getInitialColorScheme = (): ColorScheme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedScheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isColorScheme(storedScheme)) {
      return storedScheme;
    }
  } catch {
    //
  }

  return getSystemColorScheme();
};

export const getDefaultBackgroundColor = (colorScheme: ColorScheme) =>
  colorScheme === "light" ? LIGHT_DEFAULT_BG : DARK_DEFAULT_BG;

export const saveColorSchemePreference = (colorScheme: ColorScheme) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, colorScheme);
  } catch {
    //
  }
};
