import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalSection,
  ConfirmModalMessage,
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

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
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
  }, [onCancel]);

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
          <ConfirmModalMessage>{message}</ConfirmModalMessage>
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
