import { describe, expect, it } from "vitest";
import { FALLBACK_BLOCK_COLOR, normalizeHexColor, withAlpha } from "./color";

describe("withAlpha", () => {
  it("appends the alpha to a 6-digit hex", () => {
    expect(withAlpha("#aabbcc")).toBe("#aabbcc55");
  });

  it("expands a 3-digit hex before appending the alpha", () => {
    expect(withAlpha("#abc")).toBe("#aabbcc55");
  });

  it("falls back to a valid 8-digit hex for garbage input", () => {
    expect(withAlpha("linear-gradient(red, blue)")).toMatch(
      /^#[0-9a-f]{6}55$/i,
    );
  });

  it("honours a custom alpha", () => {
    expect(withAlpha("#abc", "80")).toBe("#aabbcc80");
  });
});

describe("normalizeHexColor", () => {
  it("keeps a valid hex", () => {
    expect(normalizeHexColor("#abc")).toBe("#abc");
    expect(normalizeHexColor("#aabbcc")).toBe("#aabbcc");
  });

  it("replaces anything else with the fallback", () => {
    expect(normalizeHexColor("url(https://example.com/pixel)")).toBe(
      FALLBACK_BLOCK_COLOR,
    );
    expect(normalizeHexColor(undefined)).toBe(FALLBACK_BLOCK_COLOR);
  });
});
