const buildNumberOptions = (count: number, offset: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = i + offset;
    return (
      <option key={n} value={n}>
        {n}
      </option>
    );
  });

export const CHANNEL_OPTIONS = buildNumberOptions(16, 1);
export const MIDI_VALUE_OPTIONS = buildNumberOptions(128, 0);
