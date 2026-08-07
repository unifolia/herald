import { useCallback, useState, type ReactNode } from "react";
import { HexColorPicker } from "react-colorful";
import {
  handleLabelClick,
  handleLabelChange,
  handleLabelBlur,
  handleLabelKeyDown,
} from "../util/labelHandler";
import useColorPicker from "../hooks/useColorPicker";
import { withAlpha } from "../util/color";
import type { Layout } from "../types";
import MidiSelect from "./MidiSelect";
import { CHANNEL_OPTIONS, MIDI_VALUE_OPTIONS } from "./midiOptions";
import {
  MidiFormContainer,
  FormHeader,
  FormHeaderContent,
  DragHandleButton,
  FormTitleDisplay,
  FormTitleInput,
  RemoveButton,
  FormGroup,
  FormLabel,
  ColorPicker,
  ColorSwatch,
  ColorPopover,
  HexInput,
  SelectRow,
} from "../styles/components";

export type SharedBlockField = "label" | "backgroundColor" | "midiChannel";

export interface BlockShellProps {
  id: number;
  fieldIdPrefix: string;
  label: string;
  backgroundColor: string;
  midiChannel: number;
  layout: Layout;
  secondaryLabel: string;
  secondaryValue: number;
  onSecondaryChange: (next: number) => void;
  onRemove: (id: number) => void;
  updateField: (
    id: number,
    field: SharedBlockField,
    value: string | number,
  ) => void;
  dragRef?: (el: HTMLElement | null) => void;
  onDragPointerDown?: (e: React.PointerEvent, id: number) => void;
  onMove?: (id: number, direction: -1 | 1) => void;
  isDragging?: boolean;
  children: ReactNode;
}

const BlockShell = ({
  id,
  fieldIdPrefix,
  label,
  backgroundColor,
  midiChannel,
  layout,
  secondaryLabel,
  secondaryValue,
  onSecondaryChange,
  onRemove,
  updateField,
  dragRef,
  onDragPointerDown,
  onMove,
  isDragging,
  children,
}: BlockShellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { isPickerOpen, pickerRef, swatchRef, togglePicker } = useColorPicker();

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      onDragPointerDown?.(e, id);
    },
    [onDragPointerDown, id],
  );

  const handleChannelChange = useCallback(
    (next: number) => updateField(id, "midiChannel", next),
    [updateField, id],
  );

  const handleColorChange = useCallback(
    (color: string) => updateField(id, "backgroundColor", color),
    [updateField, id],
  );

  const handleDragKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onMove?.(id, -1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onMove?.(id, 1);
      }
    },
    [onMove, id],
  );

  return (
    <MidiFormContainer
      ref={dragRef}
      data-layout={layout}
      style={{
        background: withAlpha(backgroundColor),
        ...(isDragging && { opacity: 0 }),
      }}
      role="group"
      aria-label={label}
    >
      <FormHeader>
        <FormHeaderContent>
          <DragHandleButton
            type="button"
            aria-label={`Reorder ${label}. Drag, or use Alt with the arrow keys.`}
            title="Drag to reorder (or Alt+↑/↓)"
            onPointerDown={handlePointerDown}
            onKeyDown={handleDragKeyDown}
          />
          {isEditing ? (
            <FormTitleInput
              type="text"
              value={label}
              aria-label="Control block name"
              onChange={(e) =>
                handleLabelChange((v) => updateField(id, "label", v), e)
              }
              onBlur={() =>
                handleLabelBlur(setIsEditing, label, (v) =>
                  updateField(id, "label", v),
                )
              }
              onKeyDown={(e) => handleLabelKeyDown(setIsEditing, e)}
              autoFocus
            />
          ) : (
            <FormTitleDisplay
              role="button"
              tabIndex={0}
              onClick={() => handleLabelClick(setIsEditing)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLabelClick(setIsEditing);
                }
              }}
              aria-label={`${label} — click to rename`}
            >
              {label}
            </FormTitleDisplay>
          )}
        </FormHeaderContent>
        <RemoveButton
          data-placement="header"
          onClick={() => onRemove(id)}
          aria-label={`Remove ${label}`}
        />
      </FormHeader>

      <SelectRow>
        <FormGroup>
          <FormLabel htmlFor={`${fieldIdPrefix}-midi-channel-${id}`}>
            Channel:
          </FormLabel>
          <MidiSelect
            id={`${fieldIdPrefix}-midi-channel-${id}`}
            value={midiChannel}
            options={CHANNEL_OPTIONS}
            onChange={handleChannelChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor={`${fieldIdPrefix}-secondary-${id}`}>
            {secondaryLabel}
          </FormLabel>
          <MidiSelect
            id={`${fieldIdPrefix}-secondary-${id}`}
            value={secondaryValue}
            options={MIDI_VALUE_OPTIONS}
            onChange={onSecondaryChange}
          />
        </FormGroup>
      </SelectRow>

      {children}

      <ColorPicker ref={pickerRef}>
        <FormLabel>Background:</FormLabel>
        <ColorSwatch
          ref={swatchRef}
          type="button"
          style={{ background: backgroundColor }}
          onClick={togglePicker}
          aria-label="Choose background color"
          aria-haspopup="dialog"
          aria-expanded={isPickerOpen}
        />
        {isPickerOpen && (
          <ColorPopover>
            <HexColorPicker
              color={backgroundColor}
              onChange={handleColorChange}
            />
            <HexInput
              color={backgroundColor}
              onChange={handleColorChange}
              prefixed
              aria-label="Background hex code"
            />
          </ColorPopover>
        )}
      </ColorPicker>

      <RemoveButton
        data-placement="end"
        onClick={() => onRemove(id)}
        aria-label={`Remove ${label}`}
      />
    </MidiFormContainer>
  );
};

export default BlockShell;
