import { describe, expect, it } from "vitest";
import type { MidiCCFormData } from "../types";
import type { DriftConfig } from "./modulation";
import { getDriftStep } from "./modulation";

const ccForm = (value: number): MidiCCFormData => ({
  id: 1,
  midiChannel: 1,
  midiCC: 1,
  value,
  label: "Block",
  backgroundColor: "#aabbcc",
});

const driftConfig = (overrides: Partial<DriftConfig> = {}): DriftConfig => ({
  low: 45,
  high: 85,
  direction: 1,
  moveDelayMs: 500,
  nextMoveAt: 0,
  ...overrides,
});

const LATER = 1000;
const PAST_ANY_DELAY = 2000;

describe("getDriftStep", () => {
  it("steps by one toward the range instead of snapping to it", () => {
    expect(getDriftStep(ccForm(5), driftConfig(), LATER)).toBe(6);
  });

  it("steps down by one from above the range", () => {
    expect(getDriftStep(ccForm(127), driftConfig(), LATER)).toBe(126);
  });

  it("stops at the high wall and reverses direction", () => {
    const config = driftConfig({ direction: 1 });

    expect(getDriftStep(ccForm(84), config, LATER)).toBe(85);
    expect(config.direction).toBe(-1);
  });

  it("stops at the low wall and reverses direction", () => {
    const config = driftConfig({ direction: -1 });

    expect(getDriftStep(ccForm(46), config, LATER)).toBe(45);
    expect(config.direction).toBe(1);
  });

  it("takes exactly 40 single steps to walk from 5 back into range", () => {
    const config = driftConfig({ direction: 1 });
    let value = 5;
    let now = LATER;
    let steps = 0;

    while (value < config.low && steps < 200) {
      now += PAST_ANY_DELAY;
      value = getDriftStep(ccForm(value), config, now);
      steps++;
    }

    expect(value).toBe(45);
    expect(steps).toBe(40);
  });

  it("holds the current value until the next move is due", () => {
    const config = driftConfig({ nextMoveAt: 5000 });

    expect(getDriftStep(ccForm(60), config, LATER)).toBe(60);
  });

  it("holds the current value when the range has collapsed", () => {
    const config = driftConfig({ low: 60, high: 60 });

    expect(getDriftStep(ccForm(60), config, LATER)).toBe(60);
  });
});
