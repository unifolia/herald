import { NavBar, NavButton, LayoutButton } from "../styles/components";
import type { Layout } from "../types";

interface NavigationProps {
  handleAddCCInput: () => void;
  handleAddPCInput: () => void;
  savePreset: () => void;
  openLoadPreset: () => void;
  layout: Layout;
  onToggleLayout: () => void;
}

const Navigation = ({
  handleAddCCInput,
  handleAddPCInput,
  savePreset,
  openLoadPreset,
  layout,
  onToggleLayout,
}: NavigationProps) => {
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
    </NavBar>
  );
};

export default Navigation;
