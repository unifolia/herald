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

type SendCC = (midiChannel: number, midiCC: number, value: number) => void;

interface UseModulationParams {
  ccForms: MidiCCFormData[];
  sendCC: SendCC;
  updateCCValues: (valuesById: Map<number, number>) => void;
  randomizeCCValues: () => MidiCCFormData[];
}

const useModulation = ({
  ccForms,
  sendCC,
  updateCCValues,
  randomizeCCValues,
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

  const handleRandomizeCCValues = useCallback(() => {
    clearModulationConfigs();
    setActiveModulation(null);
    const randomizedForms = randomizeCCValues();
    randomizedForms.forEach((form) => {
      sendCC(form.midiChannel, form.midiCC, form.value);
    });
  }, [clearModulationConfigs, randomizeCCValues, sendCC]);

  const handleToggleWave = useCallback(() => {
    setActiveModulation((mode) => {
      clearModulationConfigs();
      return mode === "wave" ? null : "wave";
    });
  }, [clearModulationConfigs]);

  const handleToggleDrift = useCallback(() => {
    setActiveModulation((mode) => {
      clearModulationConfigs();
      return mode === "drift" ? null : "drift";
    });
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
