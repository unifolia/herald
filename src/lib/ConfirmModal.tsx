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
  ModalSectionTitle,
  ModalActions,
  NavButton,
} from "../styles/components";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useModalDismiss(cardRef, cancelRef, onCancel);

  return createPortal(
    <ModalOverlay
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <ModalCard ref={cardRef} onClick={(event) => event.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="confirm-modal-title">{title}</ModalTitle>
          <ModalCloseButton
            type="button"
            onClick={onCancel}
            aria-label="Close"
          />
        </ModalHeader>
        <ModalSection>
          <ModalSectionTitle>{message}</ModalSectionTitle>
          <ModalActions>
            <NavButton type="button" onClick={onConfirm}>
              {confirmLabel}
            </NavButton>
            <NavButton ref={cancelRef} type="button" onClick={onCancel}>
              {cancelLabel}
            </NavButton>
          </ModalActions>
        </ModalSection>
      </ModalCard>
    </ModalOverlay>,
    document.body,
  );
};

export default ConfirmModal;
