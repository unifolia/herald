import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
} from "react";
import MidiCCForm from "./lib/MidiCCForm";
import MidiPCForm from "./lib/MidiPCForm";
import Header from "./lib/Header";
import ErrorBoundary from "./lib/ErrorBoundary";
import {
  FormsContainer,
  FooterText,
  ThemeToggleButton,
} from "./styles/components";
import { GlobalStyles, Title } from "./styles/GlobalStyles";
import Navigation from "./lib/NavBar";
import PresetBrowser from "./lib/PresetBrowser";
import Device from "./lib/Device";
import useMIDI from "./hooks/useMIDI";
import useDragReorder from "./hooks/useDragReorder";
import usePresetBlocks from "./hooks/usePresetBlocks";
import {
  getPresetLoadErrorMessage,
  readPresetFile,
  savePresetFile,
} from "./util/presetIo";
import {
  getDefaultBackgroundColor,
  getInitialColorScheme,
  saveColorSchemePreference,
} from "./util/theme";
import type { Layout, ColorScheme } from "./types";

const MAX_BLOCKS = 127;
const WAVE_TICK_MS = 180;
const WAVE_MIN_PERIOD_SECONDS = 9;
const WAVE_MAX_PERIOD_SECONDS = 23;
const DRIFT_TICK_MS = 180;
const DRIFT_MIN_DELAY_MS = 450;
const DRIFT_MAX_DELAY_MS = 1400;
const DRIFT_MIN_TRAVEL = 8;
const DRIFT_MAX_TRAVEL = 28;

type ModulationMode = "wave" | "drift" | null;

interface WaveConfig {
  low: number;
  high: number;
  angularVelocity: number;
  phase: number;
  startedAt: number;
}

interface DriftConfig {
  low: number;
  high: number;
  direction: -1 | 1;
  moveDelayMs: number;
  nextMoveAt: number;
}

const clampMidiValue = (value: number) => Math.max(0, Math.min(127, value));

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const createWaveConfig = (currentValue: number, now: number): WaveConfig => {
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
  const phase = Math.random() < 0.5
    ? Math.asin(normalizedValue)
    : Math.PI - Math.asin(normalizedValue);
  const period = randomBetween(WAVE_MIN_PERIOD_SECONDS, WAVE_MAX_PERIOD_SECONDS);

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

const getNextDriftDelay = () =>
  randomBetween(DRIFT_MIN_DELAY_MS, DRIFT_MAX_DELAY_MS);

const createDriftConfig = (currentValue: number, now: number): DriftConfig => {
  const low = clampMidiValue(
    Math.round(currentValue - randomBetween(DRIFT_MIN_TRAVEL, DRIFT_MAX_TRAVEL)),
  );
  const high = clampMidiValue(
    Math.round(currentValue + randomBetween(DRIFT_MIN_TRAVEL, DRIFT_MAX_TRAVEL)),
  );
  const direction: -1 | 1 =
    currentValue <= low ? 1 : currentValue >= high ? -1 : Math.random() < 0.5 ? -1 : 1;
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
  if (value >= config.high) {
    value = config.high;
    direction = -1;
  } else if (value <= config.low) {
    value = config.low;
    direction = 1;
  }

  config.direction = direction;
  config.moveDelayMs = getNextDriftDelay();
  config.nextMoveAt = now + config.moveDelayMs;

  return value;
};

const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    getInitialColorScheme,
  );
  const [initialBackgroundColor] = useState(() =>
    getDefaultBackgroundColor(colorScheme),
  );
  const [layout, setLayout] = useState<Layout>("tile");
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [activeModulation, setActiveModulation] =
    useState<ModulationMode>(null);
  const {
    forms,
    pcForms,
    formOrder,
    globalMidiChannel,
    allItems,
    allFormsById,
    handleIncomingCC,
    handleAddCCInput,
    handleAddPCInput,
    handleRemoveCCForm,
    handleRemovePCForm,
    updateCCFormField,
    updatePCFormField,
    updateCCValues,
    randomizeCCValues,
    handleReorder,
    handleGlobalMidiChannelChange,
    setPresetName,
    setPresetState,
  } = usePresetBlocks(initialBackgroundColor, MAX_BLOCKS);

  const { deviceList, device, setDevice, isMidiOutput, sendCC, sendPC } =
    useMIDI({ onCC: handleIncomingCC });
  const ccFormsRef = useRef(forms.inputs);
  const sendCCRef = useRef(sendCC);
  const waveConfigsRef = useRef(new Map<number, WaveConfig>());
  const driftConfigsRef = useRef(new Map<number, DriftConfig>());

  useEffect(() => {
    ccFormsRef.current = forms.inputs;
  }, [forms.inputs]);

  useEffect(() => {
    sendCCRef.current = sendCC;
  }, [sendCC]);

  const toggleLayout = useCallback(
    () => setLayout((l) => (l === "tile" ? "row" : "tile")),
    [],
  );

  const toggleColorScheme = useCallback(() => {
    setColorScheme((currentScheme) => {
      const nextScheme = currentScheme === "light" ? "dark" : "light";
      saveColorSchemePreference(nextScheme);
      return nextScheme;
    });
  }, []);

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

    const tick = () => {
      const now = performance.now();
      const formsSnapshot = ccFormsRef.current;
      const liveIds = new Set(formsSnapshot.map((form) => form.id));

      waveConfigsRef.current.forEach((_config, id) => {
        if (!liveIds.has(id)) {
          waveConfigsRef.current.delete(id);
        }
      });

      const valuesById = new Map<number, number>();
      const messagesToSend: Array<{
        midiChannel: number;
        midiCC: number;
        value: number;
      }> = [];

      formsSnapshot.forEach((form) => {
        let config = waveConfigsRef.current.get(form.id);
        if (!config) {
          config = createWaveConfig(form.value, now);
          waveConfigsRef.current.set(form.id, config);
        }

        const value = stepTowardWaveValue(form.value, getWaveValue(config, now));
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
        sendCCRef.current(message.midiChannel, message.midiCC, message.value);
      });
    };

    tick();
    const interval = window.setInterval(tick, WAVE_TICK_MS);
    return () => window.clearInterval(interval);
  }, [activeModulation, updateCCValues]);

  useEffect(() => {
    if (activeModulation !== "drift") return;

    const tick = () => {
      const now = performance.now();
      const formsSnapshot = ccFormsRef.current;
      const liveIds = new Set(formsSnapshot.map((form) => form.id));

      driftConfigsRef.current.forEach((_config, id) => {
        if (!liveIds.has(id)) {
          driftConfigsRef.current.delete(id);
        }
      });

      const valuesById = new Map<number, number>();
      const messagesToSend: Array<{
        midiChannel: number;
        midiCC: number;
        value: number;
      }> = [];

      formsSnapshot.forEach((form) => {
        let config = driftConfigsRef.current.get(form.id);
        if (!config) {
          config = createDriftConfig(form.value, now);
          driftConfigsRef.current.set(form.id, config);
        }

        const value = getDriftValue(form.value, config, now);
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
        sendCCRef.current(message.midiChannel, message.midiCC, message.value);
      });
    };

    tick();
    const interval = window.setInterval(tick, DRIFT_TICK_MS);
    return () => window.clearInterval(interval);
  }, [activeModulation, updateCCValues]);

  const {
    orderedIds,
    draggedId,
    handlePointerDown,
    registerRef,
    containerRef,
  } = useDragReorder(allItems, handleReorder);

  const savePreset = useCallback(
    () =>
      savePresetFile({
        name: forms.name,
        inputs: forms.inputs,
        pcForms,
        formOrder,
      }),
    [formOrder, forms.inputs, forms.name, pcForms],
  );

  const handleLoadPreset = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await readPresetFile(file, MAX_BLOCKS);
      if (!result.ok) {
        alert(getPresetLoadErrorMessage(result));
        return;
      }

      setPresetState(result.preset);
      setIsLoadModalOpen(false);
    },
    [setPresetState],
  );

  return (
    <>
      <GlobalStyles $colorScheme={colorScheme} />
      <ErrorBoundary>
        <main>
          <Title>Herald</Title>

          {isMidiOutput ? (
            <Device
              device={device}
              deviceList={deviceList}
              setDevice={setDevice}
            />
          ) : (
            <h2>No MIDI Devices Connected</h2>
          )}

          <Navigation
            handleAddCCInput={handleAddCCInput}
            handleAddPCInput={handleAddPCInput}
            savePreset={savePreset}
            openLoadPreset={() => setIsLoadModalOpen(true)}
            randomizeCCValues={handleRandomizeCCValues}
            isWaveActive={activeModulation === "wave"}
            onToggleWave={handleToggleWave}
            isDriftActive={activeModulation === "drift"}
            onToggleDrift={handleToggleDrift}
            globalMidiChannel={globalMidiChannel}
            handleGlobalMidiChannelChange={handleGlobalMidiChannelChange}
            layout={layout}
            onToggleLayout={toggleLayout}
          />

          {isLoadModalOpen && (
            <PresetBrowser
              backgroundColor={getDefaultBackgroundColor(colorScheme)}
              maxBlocks={MAX_BLOCKS}
              onClose={() => setIsLoadModalOpen(false)}
              onLoadPreset={(preset) => {
                setPresetState(preset);
                setIsLoadModalOpen(false);
              }}
              onUploadFile={handleLoadPreset}
            />
          )}

          <Header name={forms.name} setName={setPresetName} />

          <FormsContainer ref={containerRef} $layout={layout}>
            {orderedIds.map((id) => {
              const item = allFormsById.get(id);
              if (!item) return null;
              if (item.type === "cc") {
                const form = item.data;
                return (
                  <MidiCCForm
                    key={form.id}
                    id={form.id}
                    onRemove={handleRemoveCCForm}
                    updateCCFormField={updateCCFormField}
                    midiChannel={form.midiChannel}
                    midiCC={form.midiCC}
                    value={form.value}
                    label={form.label}
                    backgroundColor={form.backgroundColor}
                    sendCC={sendCC}
                    dragRef={registerRef(form.id)}
                    onDragPointerDown={handlePointerDown}
                    isDragging={draggedId === form.id}
                    layout={layout}
                  />
                );
              }
              const pc = item.data;
              return (
                <MidiPCForm
                  key={pc.id}
                  id={pc.id}
                  onRemove={handleRemovePCForm}
                  updatePCFormField={updatePCFormField}
                  midiChannel={pc.midiChannel}
                  program={pc.program}
                  label={pc.label}
                  backgroundColor={pc.backgroundColor}
                  sendPC={sendPC}
                  dragRef={registerRef(pc.id)}
                  onDragPointerDown={handlePointerDown}
                  isDragging={draggedId === pc.id}
                  layout={layout}
                />
              );
            })}
          </FormsContainer>
          <footer>
            <FooterText>
              <a href="https://github.com/unifolia/herald">documentation</a>
              <ThemeToggleButton
                type="button"
                onClick={toggleColorScheme}
                aria-pressed={colorScheme === "light"}
                aria-label={`Theme: ${colorScheme}. Click to switch to ${
                  colorScheme === "light" ? "dark" : "light"
                }.`}
              >
                theme: {colorScheme}
              </ThemeToggleButton>
            </FooterText>
            <FooterText>
              <a id="mothership" href="https://midi.engineering">
                𐙦 MIDI Engineering
              </a>
            </FooterText>
          </footer>
        </main>
      </ErrorBoundary>
    </>
  );
};

export default App;
