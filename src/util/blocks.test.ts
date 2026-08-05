import { describe, expect, it } from "vitest";
import type { MidiCCFormData } from "../types";
import { applyCCValues, applyIncomingCC } from "./blocks";

const ccForm = (
  overrides: Partial<MidiCCFormData> & { id: number },
): MidiCCFormData => ({
  midiChannel: 1,
  midiCC: 1,
  value: 10,
  label: "Block",
  backgroundColor: "#aabbcc",
  ...overrides,
});

const state = (inputs: MidiCCFormData[]) => ({ name: "Rig", inputs });

describe("applyIncomingCC", () => {
  it("returns the previous state by identity when no block matches the CC", () => {
    const prev = state([ccForm({ id: 1 })]);

    expect(applyIncomingCC(prev, 1, 2, 50)).toBe(prev);
  });

  it("returns the previous state by identity when no block matches the channel", () => {
    const prev = state([ccForm({ id: 1 })]);

    expect(applyIncomingCC(prev, 2, 1, 50)).toBe(prev);
  });

  it("returns the previous state by identity when the block already holds the value", () => {
    const prev = state([ccForm({ id: 1, value: 50 })]);

    expect(applyIncomingCC(prev, 1, 1, 50)).toBe(prev);
  });

  it("returns a new state when a matching block's value differs", () => {
    const prev = state([ccForm({ id: 1, value: 10 })]);
    const next = applyIncomingCC(prev, 1, 1, 50);

    expect(next).not.toBe(prev);
    expect(next.inputs[0].value).toBe(50);
  });

  it("preserves the object identity of blocks it did not touch", () => {
    const prev = state([
      ccForm({ id: 1, midiCC: 1 }),
      ccForm({ id: 2, midiCC: 2 }),
    ]);
    const next = applyIncomingCC(prev, 1, 1, 50);

    expect(next.inputs[0]).not.toBe(prev.inputs[0]);
    expect(next.inputs[1]).toBe(prev.inputs[1]);
  });

  it("does not update the same CC on a different channel", () => {
    const prev = state([
      ccForm({ id: 1, midiChannel: 1, midiCC: 7 }),
      ccForm({ id: 2, midiChannel: 2, midiCC: 7 }),
    ]);
    const next = applyIncomingCC(prev, 2, 7, 90);

    expect(next.inputs[0]).toBe(prev.inputs[0]);
    expect(next.inputs[1].value).toBe(90);
  });

  it("updates every block bound to the same channel and CC, then bails on re-apply", () => {
    const prev = state([
      ccForm({ id: 1, midiChannel: 3, midiCC: 7 }),
      ccForm({ id: 2, midiChannel: 3, midiCC: 7 }),
    ]);
    const next = applyIncomingCC(prev, 3, 7, 90);

    expect(next.inputs.map((form) => form.value)).toEqual([90, 90]);
    expect(applyIncomingCC(next, 3, 7, 90)).toBe(next);
  });
});

describe("applyCCValues", () => {
  it("returns the previous state by identity when nothing changes", () => {
    const prev = state([ccForm({ id: 1, value: 10 })]);

    expect(applyCCValues(prev, new Map())).toBe(prev);
    expect(applyCCValues(prev, new Map([[1, 10]]))).toBe(prev);
    expect(applyCCValues(prev, new Map([[99, 40]]))).toBe(prev);
  });

  it("updates only the blocks named in the map", () => {
    const prev = state([ccForm({ id: 1 }), ccForm({ id: 2 })]);
    const next = applyCCValues(prev, new Map([[2, 77]]));

    expect(next.inputs[0]).toBe(prev.inputs[0]);
    expect(next.inputs[1].value).toBe(77);
  });
});
