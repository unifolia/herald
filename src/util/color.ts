const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const FALLBACK_BLOCK_COLOR = "#516f57";

export const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX_COLOR.test(value);

export const normalizeHexColor = (value: unknown) =>
  isHexColor(value) ? value : FALLBACK_BLOCK_COLOR;

export const withAlpha = (hex: string, alpha = "55") => {
  if (!isHexColor(hex)) return `${FALLBACK_BLOCK_COLOR}${alpha}`;

  const digits = hex.slice(1);
  const expanded =
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;

  return `#${expanded}${alpha}`;
};
