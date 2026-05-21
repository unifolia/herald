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

const MAX_BLOCKS = 75;

const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    getInitialColorScheme,
  );
  const [initialBackgroundColor] = useState(() =>
    getDefaultBackgroundColor(colorScheme),
  );
  const [layout, setLayout] = useState<Layout>("tile");
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
    handleReorder,
    handleGlobalMidiChannelChange,
    setPresetName,
    setPresetState,
  } = usePresetBlocks(initialBackgroundColor, MAX_BLOCKS);

  const { deviceList, device, setDevice, isMidiOutput, sendCC, sendPC } =
    useMIDI({ onCC: handleIncomingCC });

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
        globalMidiChannel,
      }),
    [formOrder, forms.inputs, forms.name, globalMidiChannel, pcForms],
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
            handleLoadPreset={handleLoadPreset}
            globalMidiChannel={globalMidiChannel}
            handleGlobalMidiChannelChange={handleGlobalMidiChannelChange}
            layout={layout}
            onToggleLayout={toggleLayout}
          />

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
