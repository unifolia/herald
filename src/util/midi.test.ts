import { describe, expect, it } from "vitest";
import { labelMidiPorts } from "./midi";

describe("labelMidiPorts", () => {
  it("uses the port name when it is unique", () => {
    expect(labelMidiPorts([{ id: "a", name: "Pedal" }])).toEqual([
      { id: "a", label: "Pedal" },
    ]);
  });

  it("numbers ports that share a name so each stays selectable", () => {
    expect(
      labelMidiPorts([
        { id: "a", name: "USB MIDI" },
        { id: "b", name: "Pedal" },
        { id: "c", name: "USB MIDI" },
      ]),
    ).toEqual([
      { id: "a", label: "USB MIDI (1)" },
      { id: "b", label: "Pedal" },
      { id: "c", label: "USB MIDI (2)" },
    ]);
  });

  it("labels ports with no name instead of hiding them", () => {
    expect(
      labelMidiPorts([
        { id: "a", name: null },
        { id: "b", name: "  " },
      ]).map((port) => port.label),
    ).toEqual(["Unnamed device (1)", "Unnamed device (2)"]);
  });
});
