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
import type { Layout } from "../types";

interface NavigationProps {
  handleAddCCInput: () => void;
  handleAddPCInput: () => void;
  savePreset: () => void;
  openLoadPreset: () => void;
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
  globalMidiChannel,
  handleGlobalMidiChannelChange,
  layout,
  onToggleLayout,
}: NavigationProps) => {
  const [pendingChannel, setPendingChannel] = useState<number | null>(null);

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
        {layout === "tile" ? "Tile" : "Strip"}
      </LayoutButton>
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
          {Array.from({ length: 16 }, (_, i) => i + 1).map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
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
    </NavBar>
  );
};

export default Navigation;
