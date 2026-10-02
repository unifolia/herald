import { useRef } from "react";
import { createPortal } from "react-dom";
import useModalDismiss from "../hooks/useModalDismiss";
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
  ModalSectionTitle,
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

  const overlayProps = useModalDismiss(cardRef, closeRef, onClose);

  return createPortal(
    <ModalOverlay
      {...overlayProps}
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-modal-title"
    >
      <ModalCard ref={cardRef}>
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
          <ModalSectionTitle>cc transformers</ModalSectionTitle>
          <AdvancedModalActions>
            <NavButton type="button" onClick={() => runAndClose(onRandomize)}>
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
