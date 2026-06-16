import type { MidiCCFormData } from "../types";
import type { ParsedPreset } from "./presetIo";

export interface CatalogCC {
  name: string;
  cc: number;
}

export type DeviceCatalog = Record<string, CatalogCC[]>;
export type PresetCatalog = Record<string, DeviceCatalog>;

export interface TranslateOptions {
  backgroundColor: string;
  maxBlocks: number;
}

export interface TranslateResult {
  preset: ParsedPreset;
  truncated: number;
}

const CATALOG_URL = `${import.meta.env.BASE_URL}presetCatalog.json`;

let catalogPromise: Promise<PresetCatalog> | null = null;

export const fetchPresetCatalog = (): Promise<PresetCatalog> => {
  if (!catalogPromise) {
    catalogPromise = fetch(CATALOG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`presetCatalog.json: ${res.status}`);
        return res.json() as Promise<PresetCatalog>;
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
};

const DEFAULT_CC_VALUE = 64;
const DEFAULT_MIDI_CHANNEL = 1;

// Translates data from openMIDI project
// https://github.com/Morningstar-Engineering/openmidi
export const translateDevice = (
  name: string,
  ccs: CatalogCC[],
  { backgroundColor, maxBlocks }: TranslateOptions,
): TranslateResult => {
  const usable = ccs.slice(0, maxBlocks);

  const inputs: MidiCCFormData[] = usable.map((entry, index) => ({
    id: index + 1,
    midiChannel: DEFAULT_MIDI_CHANNEL,
    midiCC: entry.cc,
    value: DEFAULT_CC_VALUE,
    label: entry.name,
    backgroundColor,
  }));

  return {
    preset: {
      name,
      inputs,
      pcForms: [],
      formOrder: inputs.map((input) => input.id),
    },
    truncated: ccs.length - usable.length,
  };
};
