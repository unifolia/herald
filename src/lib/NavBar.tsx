import { useState } from "react";
import {
  NavBar,
  NavButton,
  LayoutButton,
  GlobalChannelContainer,
  GlobalChannelLabel,
  GlobalChannelSelect,
} from "../styles/components";
import ConfirmModal from "./ConfirmModal";
import AdvancedModal from "./AdvancedModal";
import { CHANNEL_OPTIONS } from "./midiOptions";
import type { Layout } from "../types";

interface NavigationProps {
  handleAddCCInput: () => void;
  handleAddPCInput: () => void;
  savePreset: () => void;
  openLoadPreset: () => void;
  randomizeCCValues: () => void;
  isWaveActive: boolean;
  onToggleWave: () => void;
  isDriftActive: boolean;
  onToggleDrift: () => void;
  globalMidiChannel: number | null;
  handleGlobalMidiChannelChange: (channel: number) => void;
  layout: Layout;
  onToggleLayout: () => void;
}

const Navigation = ({
  handleAddCCInput,
  handleAddPCInput,
  savePreset,
  openLoadPreset,
  randomizeCCValues,
  isWaveActive,
  onToggleWave,
  isDriftActive,
  onToggleDrift,
  globalMidiChannel,
  handleGlobalMidiChannelChange,
  layout,
  onToggleLayout,
}: NavigationProps) => {
  const [pendingChannel, setPendingChannel] = useState<number | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <NavBar>
      <NavButton onClick={handleAddCCInput}>Add CC Input</NavButton>
      <NavButton onClick={handleAddPCInput}>Add PC Input</NavButton>
      <NavButton onClick={savePreset}>Save Preset</NavButton>
      <NavButton onClick={openLoadPreset}>Load Preset</NavButton>
      <LayoutButton
        onClick={onToggleLayout}
        aria-pressed={layout === "row"}
        aria-label={`Layout: ${layout}. Click to toggle.`}
      >
        Layout
      </LayoutButton>
      <NavButton type="button" onClick={() => setIsAdvancedOpen(true)}>
        Advanced
      </NavButton>
      <GlobalChannelContainer>
        <GlobalChannelLabel htmlFor="global-select">
          Global Channel:
        </GlobalChannelLabel>
        <GlobalChannelSelect
          id="global-select"
          value={globalMidiChannel ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val) setPendingChannel(Number(val));
          }}
        >
          <option value="">—</option>
          {CHANNEL_OPTIONS}
        </GlobalChannelSelect>
      </GlobalChannelContainer>
      {pendingChannel !== null && (
        <ConfirmModal
          title="Set Global Channel?"
          message={`this will set every channel to ${pendingChannel}`}
          confirmLabel="Set channel"
          onConfirm={() => {
            handleGlobalMidiChannelChange(pendingChannel);
            setPendingChannel(null);
          }}
          onCancel={() => setPendingChannel(null)}
        />
      )}
      {isAdvancedOpen && (
        <AdvancedModal
          onClose={() => setIsAdvancedOpen(false)}
          onRandomize={randomizeCCValues}
          isWaveActive={isWaveActive}
          onWave={onToggleWave}
          isDriftActive={isDriftActive}
          onDrift={onToggleDrift}
        />
      )}
    </NavBar>
  );
};

export default Navigation;
