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
