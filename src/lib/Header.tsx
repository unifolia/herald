import EditableTitle from "./EditableTitle";
import { FormClickable } from "../styles/components";

interface HeaderProps {
  name: string;
  setName: (name: string) => void;
}

const Header = ({ name, setName }: HeaderProps) => (
  <FormClickable>
    <EditableTitle
      value={name}
      onChange={setName}
      inputLabel="Preset name"
      inputId="presetName"
      className="header"
      initiallyEditing
    />
  </FormClickable>
);

export default Header;
