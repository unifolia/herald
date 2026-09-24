import type { MidiCCFormData } from "../types";

interface CCFormsState {
  inputs: MidiCCFormData[];
}

const updateInputs = <T extends CCFormsState>(
  prev: T,
  nextValueFor: (form: MidiCCFormData) => number | undefined,
): T => {
  let changed = false;
  const inputs = prev.inputs.map((form) => {
    const value = nextValueFor(form);
    if (value === undefined || value === form.value) return form;

    changed = true;
    return { ...form, value };
  });

  return changed ? { ...prev, inputs } : prev;
};

export const applyIncomingCC = <T extends CCFormsState>(
  prev: T,
  channel: number,
  cc: number,
  value: number,
): T =>
  updateInputs(prev, (form) =>
    form.midiChannel === channel && form.midiCC === cc ? value : undefined,
  );

export const applyCCValues = <T extends CCFormsState>(
  prev: T,
  valuesById: Map<number, number>,
): T => updateInputs(prev, (form) => valuesById.get(form.id));

export const reconcileOrder = (current: number[], proposed: number[]) => {
  const live = new Set(current);
  const placed = new Set<number>();
  const order: number[] = [];

  for (const id of proposed) {
    if (!live.has(id) || placed.has(id)) continue;
    placed.add(id);
    order.push(id);
  }
  for (const id of current) {
    if (!placed.has(id)) order.push(id);
  }

  return order;
};

export const sortByOrder = <T extends { id: number }>(
  blocks: T[],
  order: number[],
): T[] => {
  const position = new Map(order.map((id, index) => [id, index]));
  const positionOf = (block: T) => position.get(block.id) ?? order.length;
  return [...blocks].sort((a, b) => positionOf(a) - positionOf(b));
};

export const getSharedMidiChannel = (blocks: { midiChannel: number }[]) => {
  if (blocks.length === 0) return null;
  const [{ midiChannel }] = blocks;
  return blocks.every((block) => block.midiChannel === midiChannel)
    ? midiChannel
    : null;
};
