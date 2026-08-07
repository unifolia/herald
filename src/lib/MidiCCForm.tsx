import { useEffect, useCallback, memo } from "react";
import type { MidiCCFormData, Layout } from "../types";
import BlockShell from "./BlockShell";
import { FormGroup, FormLabel, RangeInput } from "../styles/components";
import { MIDI_MAX_VALUE, MIDI_MIN_VALUE } from "../util/midi";

interface MidiCCFormProps {
  id: number;
  onRemove: (id: number) => void;
  updateCCFormField: (
    id: number,
    field: keyof MidiCCFormData,
    value: string | number,
  ) => void;
  midiChannel: number;
  midiCC: number;
  value: number;
  label: string;
  backgroundColor: string;
  sendCC: (channel: number, cc: number, value: number) => void;
  dragRef?: (el: HTMLElement | null) => void;
  onDragPointerDown?: (e: React.PointerEvent, id: number) => void;
  onMove?: (id: number, direction: -1 | 1) => void;
  isDragging?: boolean;
  layout: Layout;
}

const MidiCCForm = memo(
  ({
    id,
    onRemove,
    updateCCFormField,
    midiChannel,
    midiCC,
    value,
    label,
    backgroundColor,
    sendCC,
    dragRef,
    onDragPointerDown,
    onMove,
    isDragging,
    layout,
  }: MidiCCFormProps) => {
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      updateCCFormField(id, "value", newValue);
      sendCC(midiChannel, midiCC, newValue);
    };

    useEffect(() => {
      sendCC(midiChannel, midiCC, value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sendCC, midiChannel, midiCC]);

    const handleCCChange = useCallback(
      (next: number) => updateCCFormField(id, "midiCC", next),
      [updateCCFormField, id],
    );

    return (
      <BlockShell
        id={id}
        fieldIdPrefix="cc"
        label={label}
        backgroundColor={backgroundColor}
        midiChannel={midiChannel}
        layout={layout}
        secondaryLabel="MIDI CC:"
        secondaryValue={midiCC}
        onSecondaryChange={handleCCChange}
        onRemove={onRemove}
        updateField={updateCCFormField}
        dragRef={dragRef}
        onDragPointerDown={onDragPointerDown}
        onMove={onMove}
        isDragging={isDragging}
      >
        <FormGroup>
          <FormLabel htmlFor={`value-slider-${id}`}>Value: {value}</FormLabel>
          <RangeInput
            id={`value-slider-${id}`}
            type="range"
            min={MIDI_MIN_VALUE}
            max={MIDI_MAX_VALUE}
            value={value}
            onChange={handleValueChange}
            aria-valuetext={`${value} of ${MIDI_MAX_VALUE}`}
          />
        </FormGroup>
      </BlockShell>
    );
  },
);

export default MidiCCForm;
