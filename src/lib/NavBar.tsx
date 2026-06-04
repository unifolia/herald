import {
  NavBar,
  NavButton,
  LoadButton,
  LayoutButton,
} from "../styles/components";
import type { Layout } from "../types";

interface NavigationProps {
  handleAddCCInput: () => void;
  handleAddPCInput: () => void;
  savePreset: () => void;
  handleLoadPreset: (event: React.ChangeEvent<HTMLInputElement>) => void;
  layout: Layout;
  onToggleLayout: () => void;
}

const Navigation = ({
  handleAddCCInput,
  handleAddPCInput,
  savePreset,
  handleLoadPreset,
  layout,
  onToggleLayout,
}: NavigationProps) => {
  return (
    <NavBar>
      <NavButton onClick={handleAddCCInput}>Add CC Input</NavButton>
      <NavButton onClick={handleAddPCInput}>Add PC Input</NavButton>
      <NavButton onClick={savePreset}>Save Preset</NavButton>
      <LoadButton htmlFor="upload">
        Load Preset
        <input
          id="upload"
          type="file"
          accept=".json"
          onChange={handleLoadPreset}
          value=""
        />
      </LoadButton>
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
