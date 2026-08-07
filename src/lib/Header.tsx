import { useRef, useState } from "react";
import {
  handleLabelClick,
  handleLabelChange,
  handleLabelBlur,
  handleLabelKeyDown,
} from "../util/labelHandler";
import {
  FormClickable,
  FormTitleDisplay,
  FormTitleInput,
} from "../styles/components";

interface HeaderProps {
  name: string;
  setName: (name: string) => void;
}

const Header = ({ name, setName }: HeaderProps) => {
  const [isEditing, setIsEditing] = useState(true);
  const wasUserInitiated = useRef(false);

  const startEditing = () => {
    wasUserInitiated.current = true;
    handleLabelClick(setIsEditing);
  };

  return (
    <FormClickable>
      {isEditing ? (
        <FormTitleInput
          id="presetName"
          type="text"
          value={name}
          aria-label="Preset name"
          onChange={(e) => handleLabelChange(setName, e)}
          onBlur={() => handleLabelBlur(setIsEditing, name, setName)}
          onKeyDown={(e) => handleLabelKeyDown(setIsEditing, e)}
          className="header"
          autoFocus={wasUserInitiated.current}
        />
      ) : (
        <FormTitleDisplay
          as="h3"
          className="header"
          role="button"
          tabIndex={0}
          onClick={startEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startEditing();
            }
          }}
          aria-label={`${name} — click to rename`}
        >
          {name}
        </FormTitleDisplay>
      )}
    </FormClickable>
  );
};

export default Header;
