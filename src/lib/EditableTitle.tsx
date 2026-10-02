import { useEffect, useRef, useState } from "react";
import { FormTitleDisplay, FormTitleInput } from "../styles/components";

const FALLBACK_TITLE = "Untitled";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  inputLabel: string;
  inputId?: string;
  className?: string;
  initiallyEditing?: boolean;
}

const EditableTitle = ({
  value,
  onChange,
  inputLabel,
  inputId,
  className,
  initiallyEditing = false,
}: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(initiallyEditing);
  const wasUserInitiated = useRef(false);
  const valueAtFocus = useRef(value);
  const isReverting = useRef(false);
  const shouldRestoreFocus = useRef(false);
  const displayRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isEditing || !shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    displayRef.current?.focus();
  }, [isEditing]);

  const startEditing = () => {
    wasUserInitiated.current = true;
    setIsEditing(true);
  };

  const commit = (next: string) => {
    const committed = next.trim() ? next : FALLBACK_TITLE;
    if (committed !== value) onChange(committed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <FormTitleInput
        id={inputId}
        type="text"
        value={value}
        aria-label={inputLabel}
        className={className}
        autoFocus={wasUserInitiated.current}
        onFocus={() => {
          valueAtFocus.current = value;
        }}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          const reverting = isReverting.current;
          isReverting.current = false;
          commit(reverting ? valueAtFocus.current : value);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key !== "Enter" && e.key !== "Escape") return;

          e.preventDefault();
          isReverting.current = e.key === "Escape";
          shouldRestoreFocus.current = true;
          e.currentTarget.blur();
        }}
      />
    );
  }

  return (
    <FormTitleDisplay
      ref={displayRef}
      className={className}
      role="button"
      tabIndex={0}
      onClick={startEditing}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startEditing();
        }
      }}
      aria-label={`${value} — click to rename`}
    >
      {value}
    </FormTitleDisplay>
  );
};

export default EditableTitle;
