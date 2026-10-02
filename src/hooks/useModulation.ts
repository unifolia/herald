import { useCallback, useEffect, useRef, useState } from "react";
import type { MidiCCFormData } from "../types";
import {
  type ModulationMode,
  type WaveConfig,
  type DriftConfig,
  WAVE_TICK_MS,
  DRIFT_TICK_MS,
  createWaveConfig,
  getWaveStep,
  createDriftConfig,
  getDriftStep,
  runModulationTick,
} from "../util/modulation";
import { MIDI_MAX_VALUE } from "../util/midi";

type SendCC = (midiChannel: number, midiCC: number, value: number) => void;

interface UseModulationParams {
  ccForms: MidiCCFormData[];
  sendCC: SendCC;
  updateCCValues: (valuesById: Map<number, number>) => void;
  presetGeneration: number;
}

const useModulation = ({
  ccForms,
  sendCC,
  updateCCValues,
  presetGeneration,
}: UseModulationParams) => {
  const [activeModulation, setActiveModulation] =
    useState<ModulationMode>(null);

  const ccFormsRef = useRef(ccForms);
  const sendCCRef = useRef(sendCC);
  const waveConfigsRef = useRef(new Map<number, WaveConfig>());
  const driftConfigsRef = useRef(new Map<number, DriftConfig>());

  useEffect(() => {
    ccFormsRef.current = ccForms;
  }, [ccForms]);

  useEffect(() => {
    sendCCRef.current = sendCC;
  }, [sendCC]);

  const clearModulationConfigs = useCallback(() => {
    waveConfigsRef.current.clear();
    driftConfigsRef.current.clear();
  }, []);

  useEffect(() => {
    clearModulationConfigs();
  }, [presetGeneration, clearModulationConfigs]);

  const handleRandomizeCCValues = useCallback(() => {
    clearModulationConfigs();
    setActiveModulation(null);

    const valuesById = new Map<number, number>();
    ccFormsRef.current.forEach((form) => {
      const value = Math.floor(Math.random() * (MIDI_MAX_VALUE + 1));
      valuesById.set(form.id, value);
      sendCCRef.current(form.midiChannel, form.midiCC, value);
    });
    updateCCValues(valuesById);
  }, [clearModulationConfigs, updateCCValues]);

  const handleToggleWave = useCallback(() => {
    clearModulationConfigs();
    setActiveModulation((mode) => (mode === "wave" ? null : "wave"));
  }, [clearModulationConfigs]);

  const handleToggleDrift = useCallback(() => {
    clearModulationConfigs();
    setActiveModulation((mode) => (mode === "drift" ? null : "drift"));
  }, [clearModulationConfigs]);

  useEffect(() => {
    if (activeModulation !== "wave") return;

    const tick = () =>
      runModulationTick(
        ccFormsRef.current,
        waveConfigsRef.current,
        createWaveConfig,
        getWaveStep,
        performance.now(),
        updateCCValues,
        sendCCRef.current,
      );

    tick();
    const interval = window.setInterval(tick, WAVE_TICK_MS);
    return () => window.clearInterval(interval);
  }, [activeModulation, updateCCValues]);

  useEffect(() => {
    if (activeModulation !== "drift") return;

    const tick = () =>
      runModulationTick(
        ccFormsRef.current,
        driftConfigsRef.current,
        createDriftConfig,
        getDriftStep,
        performance.now(),
        updateCCValues,
        sendCCRef.current,
      );

    tick();
    const interval = window.setInterval(tick, DRIFT_TICK_MS);
    return () => window.clearInterval(interval);
  }, [activeModulation, updateCCValues]);

  return {
    activeModulation,
    handleRandomizeCCValues,
    handleToggleWave,
    handleToggleDrift,
  };
};

export default useModulation;
