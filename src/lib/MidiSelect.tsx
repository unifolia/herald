import { memo, useCallback, useState } from "react";
import { Select } from "../styles/components";

interface MidiSelectProps {
  id: string;
  value: number;
  options: React.ReactElement[];
  onChange: (value: number) => void;
}

const MidiSelect = memo(({ id, value, options, onChange }: MidiSelectProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expand = useCallback(() => setIsExpanded(true), []);

  return (
    <Select
      id={id}
      value={value}
      onPointerEnter={expand}
      onFocus={expand}
      onPointerDown={expand}
      onKeyDown={expand}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {isExpanded ? options : <option value={value}>{value}</option>}
    </Select>
  );
});

export default MidiSelect;
