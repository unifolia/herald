export const MIDI_MIN_VALUE = 0;
export const MIDI_MAX_VALUE = 127;
export const MIDI_MIN_CHANNEL = 1;
export const MIDI_MAX_CHANNEL = 16;

export const clampMidiValue = (value: number) =>
  Math.max(MIDI_MIN_VALUE, Math.min(MIDI_MAX_VALUE, value));

export const isMidiValue = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIDI_MIN_VALUE &&
  value <= MIDI_MAX_VALUE;

export const isMidiChannel = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIDI_MIN_CHANNEL &&
  value <= MIDI_MAX_CHANNEL;

export const isBlockId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value);

export const toSafeMidiValue = (value: number) =>
  Number.isFinite(value) ? clampMidiValue(Math.round(value)) : null;

export const toSafeMidiChannel = (channel: number) =>
  Number.isFinite(channel)
    ? Math.max(MIDI_MIN_CHANNEL, Math.min(MIDI_MAX_CHANNEL, Math.round(channel)))
    : null;

export interface MidiPortOption {
  id: string;
  label: string;
}

const UNNAMED_PORT = "Unnamed device";

export const labelMidiPorts = (
  ports: { id: string; name: string | null }[],
): MidiPortOption[] => {
  const names = ports.map((port) => port.name?.trim() || UNNAMED_PORT);
  const totals = new Map<string, number>();
  names.forEach((name) => totals.set(name, (totals.get(name) ?? 0) + 1));

  const seen = new Map<string, number>();
  return ports.map((port, index) => {
    const name = names[index];
    if (totals.get(name) === 1) return { id: port.id, label: name };

    const occurrence = (seen.get(name) ?? 0) + 1;
    seen.set(name, occurrence);
    return { id: port.id, label: `${name} (${occurrence})` };
  });
};
