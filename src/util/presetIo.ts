import type { MidiCCFormData, MidiPCFormData } from "../types";
import { isBlockId, isMidiChannel, isMidiValue } from "./midi";
import { normalizeHexColor } from "./color";

export interface ParsedPreset {
  name: string;
  inputs: MidiCCFormData[];
  pcForms: MidiPCFormData[];
  formOrder: number[];
}

export type ParsePresetResult =
  | { ok: true; preset: ParsedPreset }
  | { ok: false; error: "invalid" | "empty" | "too-many"; max?: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseCCBlock = (raw: unknown): MidiCCFormData | null => {
  if (!isRecord(raw)) return null;

  const { id, midiChannel, midiCC, value, label } = raw;
  if (
    !isBlockId(id) ||
    !isMidiChannel(midiChannel) ||
    !isMidiValue(midiCC) ||
    !isMidiValue(value) ||
    typeof label !== "string"
  ) {
    return null;
  }

  return {
    id,
    midiChannel,
    midiCC,
    value,
    label,
    backgroundColor: normalizeHexColor(raw.backgroundColor),
  };
};

const parsePCBlock = (raw: unknown): MidiPCFormData | null => {
  if (!isRecord(raw)) return null;

  const { id, midiChannel, program, label } = raw;
  if (
    !isBlockId(id) ||
    !isMidiChannel(midiChannel) ||
    !isMidiValue(program) ||
    typeof label !== "string"
  ) {
    return null;
  }

  return {
    id,
    midiChannel,
    program,
    label,
    backgroundColor: normalizeHexColor(raw.backgroundColor),
  };
};

const collectBlocks = <T extends { id: number }>(
  source: unknown,
  parseBlock: (raw: unknown) => T | null,
  claimedIds: Set<number>,
): T[] => {
  if (!Array.isArray(source)) return [];

  const blocks: T[] = [];
  for (const entry of source) {
    const block = parseBlock(entry);
    if (!block || claimedIds.has(block.id)) continue;

    claimedIds.add(block.id);
    blocks.push(block);
  }

  return blocks;
};

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

  if (!isRecord(raw)) return { ok: false, error: "invalid" };
  const preset = raw;

  if (!Array.isArray(preset.inputs) && !Array.isArray(preset.pcForms)) {
    return { ok: false, error: "invalid" };
  }

  const allIds = new Set<number>();
  const inputs = collectBlocks(preset.inputs, parseCCBlock, allIds);
  const pcForms = collectBlocks(preset.pcForms, parsePCBlock, allIds);

  const total = inputs.length + pcForms.length;
  if (total === 0) return { ok: false, error: "empty" };
  if (total > maxBlocks) return { ok: false, error: "too-many", max: maxBlocks };

  const orderedIds = new Set<number>();
  if (Array.isArray(preset.formOrder)) {
    for (const id of preset.formOrder) {
      if (typeof id === "number" && allIds.has(id)) orderedIds.add(id);
    }
  }
  for (const id of allIds) orderedIds.add(id);
  const formOrder = [...orderedIds];

  return {
    ok: true,
    preset: {
      name: typeof preset.name === "string" ? preset.name : "Untitled Preset",
      inputs,
      pcForms,
      formOrder,
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
      try {
        resolve(parsePreset(typeof text === "string" ? text : "", maxBlocks));
      } catch {
        resolve({ ok: false, error: "invalid" });
      }
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
