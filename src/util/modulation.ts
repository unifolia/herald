import type { MidiCCFormData } from "../types";
import { clampMidiValue } from "./midi";

export type ModulationMode = "wave" | "drift" | null;

export const WAVE_TICK_MS = 180;
const WAVE_MIN_PERIOD_SECONDS = 9;
const WAVE_MAX_PERIOD_SECONDS = 23;
export const DRIFT_TICK_MS = 180;
const DRIFT_MIN_DELAY_MS = 450;
const DRIFT_MAX_DELAY_MS = 1400;
const DRIFT_MIN_TRAVEL = 8;
const DRIFT_MAX_TRAVEL = 28;

export interface WaveConfig {
  low: number;
  high: number;
  angularVelocity: number;
  phase: number;
  startedAt: number;
}

export interface DriftConfig {
  low: number;
  high: number;
  direction: -1 | 1;
  moveDelayMs: number;
  nextMoveAt: number;
}

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const createWaveConfig = (
  currentValue: number,
  now: number,
): WaveConfig => {
  const lowerTravel = randomBetween(18, 54);
  const upperTravel = randomBetween(18, 54);
  let low = clampMidiValue(Math.round(currentValue - lowerTravel));
  let high = clampMidiValue(Math.round(currentValue + upperTravel));

  if (high - low < 24) {
    const expansion = 24 - (high - low);
    low = clampMidiValue(low - Math.ceil(expansion / 2));
    high = clampMidiValue(high + Math.floor(expansion / 2));
  }

  if (high <= low) {
    low = Math.max(0, currentValue - 12);
    high = Math.min(127, currentValue + 12);
  }

  const center = (low + high) / 2;
  const amplitude = Math.max(1, (high - low) / 2);
  const normalizedValue = Math.max(
    -1,
    Math.min(1, (currentValue - center) / amplitude),
  );
  const phase =
    Math.random() < 0.5
      ? Math.asin(normalizedValue)
      : Math.PI - Math.asin(normalizedValue);
  const period = randomBetween(
    WAVE_MIN_PERIOD_SECONDS,
    WAVE_MAX_PERIOD_SECONDS,
  );

  return {
    low,
    high,
    angularVelocity: (Math.PI * 2) / period,
    phase,
    startedAt: now,
  };
};

const getWaveValue = (config: WaveConfig, now: number) => {
  const elapsedSeconds = (now - config.startedAt) / 1000;
  const center = (config.low + config.high) / 2;
  const amplitude = (config.high - config.low) / 2;

  return clampMidiValue(
    Math.round(
      center +
        amplitude *
          Math.sin(config.phase + elapsedSeconds * config.angularVelocity),
    ),
  );
};

const stepTowardWaveValue = (currentValue: number, targetValue: number) => {
  if (targetValue === currentValue) return currentValue;
  return currentValue + Math.sign(targetValue - currentValue);
};

export const getWaveStep = (
  form: MidiCCFormData,
  config: WaveConfig,
  now: number,
) => stepTowardWaveValue(form.value, getWaveValue(config, now));

const getNextDriftDelay = () =>
  randomBetween(DRIFT_MIN_DELAY_MS, DRIFT_MAX_DELAY_MS);

export const createDriftConfig = (
  currentValue: number,
  now: number,
): DriftConfig => {
  const low = clampMidiValue(
    Math.round(
      currentValue - randomBetween(DRIFT_MIN_TRAVEL, DRIFT_MAX_TRAVEL),
    ),
  );
  const high = clampMidiValue(
    Math.round(
      currentValue + randomBetween(DRIFT_MIN_TRAVEL, DRIFT_MAX_TRAVEL),
    ),
  );
  const direction: -1 | 1 =
    currentValue <= low
      ? 1
      : currentValue >= high
        ? -1
        : Math.random() < 0.5
          ? -1
          : 1;
  const moveDelayMs = getNextDriftDelay();

  return {
    low,
    high,
    direction,
    moveDelayMs,
    nextMoveAt: now + randomBetween(0, moveDelayMs),
  };
};

const getDriftValue = (
  currentValue: number,
  config: DriftConfig,
  now: number,
) => {
  if (now < config.nextMoveAt || config.high <= config.low) {
    return currentValue;
  }

  let direction = config.direction;
  if (currentValue <= config.low) {
    direction = 1;
  } else if (currentValue >= config.high) {
    direction = -1;
  }

  let value = clampMidiValue(currentValue + direction);
  if (value >= config.high && currentValue <= config.high) {
    value = config.high;
    direction = -1;
  } else if (value <= config.low && currentValue >= config.low) {
    value = config.low;
    direction = 1;
  }

  config.direction = direction;
  config.moveDelayMs = getNextDriftDelay();
  config.nextMoveAt = now + config.moveDelayMs;

  return value;
};

export const getDriftStep = (
  form: MidiCCFormData,
  config: DriftConfig,
  now: number,
) => getDriftValue(form.value, config, now);

export const runModulationTick = <C>(
  forms: MidiCCFormData[],
  configs: Map<number, C>,
  createConfig: (currentValue: number, now: number) => C,
  computeValue: (form: MidiCCFormData, config: C, now: number) => number,
  now: number,
  updateCCValues: (valuesById: Map<number, number>) => void,
  sendCC: (midiChannel: number, midiCC: number, value: number) => void,
) => {
  const liveIds = new Set(forms.map((form) => form.id));
  configs.forEach((_config, id) => {
    if (!liveIds.has(id)) configs.delete(id);
  });

  const valuesById = new Map<number, number>();
  const messagesToSend: Array<{
    midiChannel: number;
    midiCC: number;
    value: number;
  }> = [];

  forms.forEach((form) => {
    let config = configs.get(form.id);
    if (!config) {
      config = createConfig(form.value, now);
      configs.set(form.id, config);
    }

    const value = computeValue(form, config, now);
    if (value === form.value) return;

    valuesById.set(form.id, value);
    messagesToSend.push({
      midiChannel: form.midiChannel,
      midiCC: form.midiCC,
      value,
    });
  });

  if (valuesById.size === 0) return;

  updateCCValues(valuesById);
  messagesToSend.forEach((message) => {
    sendCC(message.midiChannel, message.midiCC, message.value);
  });
};
