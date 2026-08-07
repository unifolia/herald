import { useState, useCallback, useEffect, useRef, memo } from "react";
import type { MidiPCFormData, Layout } from "../types";
import BlockShell from "./BlockShell";
import { SendButton } from "../styles/components";
import { SEND_FLASH_MS } from "../constants";

interface MidiPCFormProps {
  id: number;
  onRemove: (id: number) => void;
  updatePCFormField: (
    id: number,
    field: keyof MidiPCFormData,
    value: string | number,
  ) => void;
  midiChannel: number;
  program: number;
  label: string;
  backgroundColor: string;
  sendPC: (channel: number, program: number) => void;
  dragRef?: (el: HTMLElement | null) => void;
  onDragPointerDown?: (e: React.PointerEvent, id: number) => void;
  onMove?: (id: number, direction: -1 | 1) => void;
  isDragging?: boolean;
  layout: Layout;
}

const MidiPCForm = memo(
  ({
    id,
    onRemove,
    updatePCFormField,
    midiChannel,
    program,
    label,
    backgroundColor,
    sendPC,
    dragRef,
    onDragPointerDown,
    onMove,
    isDragging,
    layout,
  }: MidiPCFormProps) => {
    const [sent, setSent] = useState(false);
    const sentTimer = useRef<ReturnType<typeof setTimeout>>();

    const handleProgramChange = useCallback(
      (next: number) => updatePCFormField(id, "program", next),
      [updatePCFormField, id],
    );

    const handleSend = useCallback(() => {
      sendPC(midiChannel, program);
      clearTimeout(sentTimer.current);
      setSent(true);
      sentTimer.current = setTimeout(() => setSent(false), SEND_FLASH_MS);
    }, [sendPC, midiChannel, program]);

    useEffect(() => () => clearTimeout(sentTimer.current), []);

    return (
      <BlockShell
        id={id}
        fieldIdPrefix="pc"
        label={label}
        backgroundColor={backgroundColor}
        midiChannel={midiChannel}
        layout={layout}
        secondaryLabel="MIDI PC:"
        secondaryValue={program}
        onSecondaryChange={handleProgramChange}
        onRemove={onRemove}
        updateField={updatePCFormField}
        dragRef={dragRef}
        onDragPointerDown={onDragPointerDown}
        onMove={onMove}
        isDragging={isDragging}
      >
        <SendButton
          type="button"
          className={sent ? "sent" : ""}
          onClick={handleSend}
        >
          Send
        </SendButton>
      </BlockShell>
    );
  },
);

export default MidiPCForm;
