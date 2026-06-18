import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalSection,
  AdvancedModalActions,
  NavButton,
  AdvancedModeButton,
} from "../styles/components";

interface AdvancedModalProps {
  onClose: () => void;
  onRandomize: () => void;
  isWaveActive: boolean;
  onWave: () => void;
  isDriftActive: boolean;
  onDrift: () => void;
}

const AdvancedModal = ({
  onClose,
  onRandomize,
  isWaveActive,
  onWave,
  isDriftActive,
  onDrift,
}: AdvancedModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const runAndClose = (action: () => void) => {
    action();
    onClose();
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !cardRef.current) return;

      const focusable = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <ModalOverlay
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-modal-title"
    >
      <ModalCard ref={cardRef} onClick={(event) => event.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="advanced-modal-title">Advanced</ModalTitle>
          <ModalCloseButton
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
          />
        </ModalHeader>
        <ModalSection>
          <AdvancedModalActions>
            <NavButton
              type="button"
              onClick={() => runAndClose(onRandomize)}
            >
              Randomize
            </NavButton>
            <AdvancedModeButton
              type="button"
              onClick={() => runAndClose(onWave)}
              aria-pressed={isWaveActive}
            >
              Wave
            </AdvancedModeButton>
            <AdvancedModeButton
              type="button"
              onClick={() => runAndClose(onDrift)}
              aria-pressed={isDriftActive}
            >
              Drift
            </AdvancedModeButton>
          </AdvancedModalActions>
        </ModalSection>
      </ModalCard>
    </ModalOverlay>,
    document.body,
  );
};

export default AdvancedModal;
