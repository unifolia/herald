import type { MidiCCFormData, MidiPCFormData } from "../types";

export interface ParsedPreset {
  name: string;
  inputs: MidiCCFormData[];
  pcForms: MidiPCFormData[];
  formOrder: number[];
  globalMidiChannel: number | null;
}

export type ParsePresetResult =
  | { ok: true; preset: ParsedPreset }
  | { ok: false; error: "invalid" | "empty" | "too-many"; max?: number };

export const parsePreset = (
  text: string,
  maxBlocks: number,
): ParsePresetResult => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "invalid" };
  }

  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid" };
  const preset = raw as Record<string, unknown>;

  if (!Array.isArray(preset.inputs) && !Array.isArray(preset.pcForms)) {
    return { ok: false, error: "invalid" };
  }

  const inputs = (Array.isArray(preset.inputs) ? preset.inputs : []).filter(
    (f: Record<string, unknown>) =>
      typeof f.id === "number" &&
      typeof f.midiChannel === "number" &&
      typeof f.midiCC === "number" &&
      typeof f.value === "number" &&
      typeof f.label === "string" &&
      typeof f.backgroundColor === "string",
  ) as MidiCCFormData[];

  const pcForms = (Array.isArray(preset.pcForms) ? preset.pcForms : []).filter(
    (f: Record<string, unknown>) =>
      typeof f.id === "number" &&
      typeof f.midiChannel === "number" &&
      typeof f.program === "number" &&
      typeof f.label === "string" &&
      typeof f.backgroundColor === "string",
  ) as MidiPCFormData[];

  const total = inputs.length + pcForms.length;
  if (total === 0) return { ok: false, error: "empty" };
  if (total > maxBlocks) return { ok: false, error: "too-many", max: maxBlocks };

  const allIds = new Set([
    ...inputs.map((f) => f.id),
    ...pcForms.map((f) => f.id),
  ]);

  let formOrder: number[];
  if (Array.isArray(preset.formOrder)) {
    formOrder = preset.formOrder.filter(
      (id: unknown): id is number =>
        typeof id === "number" && allIds.has(id),
    );
    const inOrder = new Set(formOrder);
    for (const id of allIds) {
      if (!inOrder.has(id)) formOrder.push(id);
    }
  } else {
    formOrder = [...allIds];
  }

  return {
    ok: true,
    preset: {
      name: typeof preset.name === "string" ? preset.name : "Untitled Preset",
      inputs,
      pcForms,
      formOrder,
      globalMidiChannel:
        typeof preset.globalMidiChannel === "number"
          ? preset.globalMidiChannel
          : null,
    },
  };
};

export const savePresetFile = async (preset: ParsedPreset) => {
  const dataStr = JSON.stringify(
    {
      ...preset,
      timestamp: new Date().toISOString(),
    },
    null,
    2,
  );
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const suggestedName = preset.name.replace(/[^a-z0-9]/gi, "_");

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${suggestedName}.json`,
      });
      const writable = await handle.createWritable();
      await writable.write(dataBlob);
      await writable.close();
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        console.error("Save failed:", error);
      }
    }
    return;
  }

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${suggestedName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readPresetFile = (
  file: File,
  maxBlocks: number,
): Promise<ParsePresetResult> =>
  new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const text = event.target?.result;
      resolve(parsePreset(typeof text === "string" ? text : "", maxBlocks));
    };

    reader.onerror = () => resolve({ ok: false, error: "invalid" });
    reader.onabort = () => resolve({ ok: false, error: "invalid" });
    reader.readAsText(file);
  });

export const getPresetLoadErrorMessage = (
  result: Extract<ParsePresetResult, { ok: false }>,
) => {
  if (result.error === "empty") {
    return "No valid blocks found in preset file";
  }

  if (result.error === "too-many") {
    return `Preset files can include up to ${result.max} blocks`;
  }

  return "Invalid preset file";
};
