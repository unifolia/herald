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
