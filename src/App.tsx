import { useState, useCallback, type ChangeEvent } from "react";
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
import useMIDI, { type MidiStatus } from "./hooks/useMIDI";
import useDragReorder from "./hooks/useDragReorder";
import usePresetBlocks from "./hooks/usePresetBlocks";
import useModulation from "./hooks/useModulation";
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
import { MAX_BLOCKS } from "./constants";

const MIDI_STATUS_MESSAGES: Record<MidiStatus, string> = {
  pending: "Waiting for MIDI Access…",
  unsupported: "This Browser Doesn't Support Web MIDI",
  blocked: "MIDI Access Is Blocked for This Site",
  ready: "No MIDI Devices Connected",
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
  const {
    forms,
    pcForms,
    formOrder,
    sharedMidiChannel,
    presetGeneration,
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
    handleReorder,
    handleGlobalMidiChannelChange,
    setPresetName,
    setPresetState,
  } = usePresetBlocks(initialBackgroundColor, MAX_BLOCKS);

  const { status, deviceList, device, setDevice, sendCC, sendPC } = useMIDI({
    onCC: handleIncomingCC,
  });

  const {
    activeModulation,
    handleRandomizeCCValues,
    handleToggleWave,
    handleToggleDrift,
  } = useModulation({
    ccForms: forms.inputs,
    sendCC,
    updateCCValues,
    presetGeneration,
  });

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

  const { orderedIds, draggedId, handlePointerDown, moveItem, registerRef } =
    useDragReorder(allItems, handleReorder);

  const savePreset = useCallback(async () => {
    const saved = await savePresetFile({
      name: forms.name,
      inputs: forms.inputs,
      pcForms,
      formOrder,
    });
    if (!saved) alert("Could not save preset file");
  }, [formOrder, forms.inputs, forms.name, pcForms]);

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

          {status === "ready" && deviceList.length > 0 ? (
            <Device
              device={device}
              deviceList={deviceList}
              setDevice={setDevice}
            />
          ) : (
            <h2>{MIDI_STATUS_MESSAGES[status]}</h2>
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
            sharedMidiChannel={sharedMidiChannel}
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

          <FormsContainer $layout={layout}>
            {orderedIds.map((id) => {
              const item = allFormsById.get(id);
              if (!item) return null;
              if (item.type === "cc") {
                const form = item.data;
                return (
                  <MidiCCForm
                    key={`${presetGeneration}:${form.id}`}
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
                    onMove={moveItem}
                    isDragging={draggedId === form.id}
                    layout={layout}
                  />
                );
              }
              const pc = item.data;
              return (
                <MidiPCForm
                  key={`${presetGeneration}:${pc.id}`}
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
                  onMove={moveItem}
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
