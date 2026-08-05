import { describe, expect, it } from "vitest";
import { parsePreset } from "./presetIo";
import { FALLBACK_BLOCK_COLOR } from "./color";

const MAX_BLOCKS = 50;

const ccBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  midiChannel: 1,
  midiCC: 1,
  value: 64,
  label: "Block",
  backgroundColor: "#aabbcc",
  ...overrides,
});

const pcBlock = (overrides: Record<string, unknown> = {}) => ({
  id: -1,
  midiChannel: 1,
  program: 0,
  label: "Program",
  backgroundColor: "#aabbcc",
  ...overrides,
});

const parse = (preset: unknown, maxBlocks = MAX_BLOCKS) =>
  parsePreset(JSON.stringify(preset), maxBlocks);

describe("parsePreset", () => {
  it("returns a result rather than throwing on a null block", () => {
    expect(parsePreset('{"inputs":[null]}', MAX_BLOCKS)).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("drops only the null when it is mixed with a valid block", () => {
    const result = parse({ inputs: [null, ccBlock({ id: 2 })] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.inputs).toHaveLength(1);
    expect(result.preset.inputs[0].id).toBe(2);
  });

  it.each([
    ["value above range", { value: 200 }],
    ["negative value", { value: -50 }],
    ["fractional value", { value: 3.7 }],
    ["channel below range", { midiChannel: 0 }],
    ["channel above range", { midiChannel: 9999 }],
  ])("rejects a block with a %s", (_label, overrides) => {
    expect(parse({ inputs: [ccBlock(overrides)] })).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("rejects an id that JSON.parse turns into Infinity", () => {
    const text =
      '{"inputs":[{"id":1e999,"midiChannel":1,"midiCC":1,"value":64,"label":"Block"}]}';

    expect(parsePreset(text, MAX_BLOCKS)).toEqual({ ok: false, error: "empty" });
  });

  it("accepts a valid block", () => {
    const result = parse({ name: "Rig", inputs: [ccBlock()] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.name).toBe("Rig");
    expect(result.preset.inputs[0]).toEqual({
      id: 1,
      midiChannel: 1,
      midiCC: 1,
      value: 64,
      label: "Block",
      backgroundColor: "#aabbcc",
    });
  });

  it("accepts the upper boundary of every range", () => {
    const result = parse({
      inputs: [ccBlock({ value: 127, midiCC: 127, midiChannel: 16 })],
    });

    expect(result.ok).toBe(true);
  });

  it("collapses a 500,000-entry formOrder to one entry", () => {
    const result = parse({
      inputs: [ccBlock({ id: 1 })],
      formOrder: new Array(500_000).fill(1),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.formOrder).toEqual([1]);
  });

  it("dedupes duplicate ids within inputs", () => {
    const result = parse({
      inputs: [ccBlock({ id: 1, label: "First" }), ccBlock({ id: 1 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.inputs).toHaveLength(1);
    expect(result.preset.inputs[0].label).toBe("First");
  });

  it("dedupes an id colliding across inputs and pcForms", () => {
    const result = parse({
      inputs: [ccBlock({ id: 7 })],
      pcForms: [pcBlock({ id: 7 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.inputs).toHaveLength(1);
    expect(result.preset.pcForms).toHaveLength(0);
  });

  it("backfills a partial formOrder, preserving the given order", () => {
    const result = parse({
      inputs: [ccBlock({ id: 1 }), ccBlock({ id: 2 }), ccBlock({ id: 3 })],
      formOrder: [3, 1],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.formOrder).toEqual([3, 1, 2]);
  });

  it("never returns a formOrder longer than the block count", () => {
    const result = parse({
      inputs: [ccBlock({ id: 1 }), ccBlock({ id: 2 })],
      formOrder: [2, 2, 1, 99, 1, 404],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.formOrder).toEqual([2, 1]);
  });

  it("replaces a url() backgroundColor with the fallback hex", () => {
    const result = parse({
      inputs: [ccBlock({ backgroundColor: "url(https://example.com/pixel)" })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preset.inputs[0].backgroundColor).toBe(FALLBACK_BLOCK_COLOR);
  });

  it("rejects a preset with more blocks than the cap", () => {
    const result = parse(
      { inputs: [ccBlock({ id: 1 }), ccBlock({ id: 2 })] },
      1,
    );

    expect(result).toEqual({ ok: false, error: "too-many", max: 1 });
  });
});
