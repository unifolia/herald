import { describe, expect, it } from "vitest";
import { translateDevice, type CatalogCC } from "./translatePreset";

const options = { backgroundColor: "#aabbcc", maxBlocks: 3 };

describe("translateDevice", () => {
  it("builds one CC block per catalog entry in catalog order", () => {
    const { preset } = translateDevice(
      "Pedal",
      [
        { name: "Mix", cc: 7 },
        { name: "Tone", cc: 14 },
      ],
      options,
    );

    expect(preset.inputs.map((input) => [input.label, input.midiCC])).toEqual([
      ["Mix", 7],
      ["Tone", 14],
    ]);
    expect(preset.formOrder).toEqual(preset.inputs.map((input) => input.id));
  });

  it("skips entries whose CC or name is unusable", () => {
    const ccs = [
      { name: "Good", cc: 1 },
      { name: "Too high", cc: 128 },
      { name: "Fractional", cc: 2.5 },
      { name: "", cc: 3 },
      null,
      { name: "Stringly", cc: "4" },
    ] as unknown as CatalogCC[];

    const { preset } = translateDevice("Pedal", ccs, options);

    expect(preset.inputs.map((input) => input.label)).toEqual(["Good"]);
  });

  it("caps at maxBlocks and reports how many were dropped", () => {
    const ccs = Array.from({ length: 5 }, (_, i) => ({
      name: `P${i}`,
      cc: i,
    }));

    const { preset, truncated } = translateDevice("Pedal", ccs, options);

    expect(preset.inputs).toHaveLength(3);
    expect(truncated).toBe(2);
  });
});
