import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalSection,
  ModalSectionTitle,
  ModalHint,
  ModalDivider,
  ModalField,
  ModalSelect,
  ModalUploadButton,
  NavButton,
} from "../styles/components";
import {
  fetchPresetCatalog,
  translateDevice,
  type PresetCatalog,
} from "../util/translatePreset";
import type { ParsedPreset } from "../util/presetIo";

interface PresetBrowserProps {
  backgroundColor: string;
  maxBlocks: number;
  onClose: () => void;
  onLoadPreset: (preset: ParsedPreset) => void;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

// Combine brand + device into a single preset name without repeating the brand
// when the device name already includes it (e.g. "Chase Bliss" / "Mood MkII").
const presetName = (brand: string, device: string) =>
  device.toLowerCase().includes(brand.toLowerCase())
    ? device
    : `${brand} ${device}`;

const PresetBrowser = ({
  backgroundColor,
  maxBlocks,
  onClose,
  onLoadPreset,
  onUploadFile,
}: PresetBrowserProps) => {
  const [catalog, setCatalog] = useState<PresetCatalog | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">(
    "idle",
  );
  const [brand, setBrand] = useState("");
  const [device, setDevice] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handlePullData = () => {
    setStatus("loading");
    fetchPresetCatalog()
      .then((data) => {
        setCatalog(data);
        setStatus("ready");
      })
      .catch(() => setStatus("failed"));
  };

  // Move focus into the dialog on open and restore it to the trigger on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Close on Escape, and trap Tab focus within the dialog.
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

  const brands = useMemo(
    () => (catalog ? Object.keys(catalog) : []),
    [catalog],
  );
  const devices = useMemo(
    () => (catalog && brand ? Object.keys(catalog[brand]) : []),
    [catalog, brand],
  );

  const selectedCCs =
    catalog && brand && device ? catalog[brand][device] : null;
  const truncated = selectedCCs
    ? Math.max(0, selectedCCs.length - maxBlocks)
    : 0;

  const handleLoadDevice = () => {
    if (!selectedCCs) return;
    const { preset } = translateDevice(presetName(brand, device), selectedCCs, {
      backgroundColor,
      maxBlocks,
    });
    onLoadPreset(preset);
    onClose();
  };

  return (
    <ModalOverlay
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="load-preset-title"
    >
      <ModalCard ref={cardRef} onClick={(event) => event.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="load-preset-title">Load Preset</ModalTitle>
          <ModalCloseButton
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
          />
        </ModalHeader>
        <ModalSection>
          <ModalSectionTitle>
            {" "}
            <span aria-hidden>🏰</span> load your own preset{" "}
            <span aria-hidden>🏰</span>
          </ModalSectionTitle>
          <ModalUploadButton htmlFor="upload">
            choose file
            <input
              id="upload"
              type="file"
              accept=".json"
              onChange={onUploadFile}
              value=""
            />
          </ModalUploadButton>
        </ModalSection>

        <ModalDivider>or</ModalDivider>

        <ModalSection>
          <ModalSectionTitle>use a premade one (beta)</ModalSectionTitle>
          <ModalHint>
            thanks to Morningstar Engineering's{" "}
            <a href="https://www.openmidi.com/">openMIDI</a> project
          </ModalHint>
          {status === "idle" ? (
            <NavButton type="button" onClick={handlePullData}>
              pull data
            </NavButton>
          ) : status === "loading" ? (
            <ModalHint>loading device list…</ModalHint>
          ) : status === "failed" ? (
            <ModalHint>*openMIDI presets are currently unavailable*</ModalHint>
          ) : (
            <>
              <ModalField>
                brand
                <ModalSelect
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setDevice("");
                  }}
                >
                  <option value="">select brand…</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </ModalSelect>
              </ModalField>

              <ModalField>
                device
                <ModalSelect
                  value={device}
                  disabled={!brand}
                  onChange={(e) => setDevice(e.target.value)}
                >
                  <option value="">
                    {brand ? "select device…" : "select a brand first…"}
                  </option>
                  {devices.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </ModalSelect>
              </ModalField>

              {truncated > 0 && (
                <ModalHint>
                  this device has {selectedCCs!.length} controls; only the first{" "}
                  {maxBlocks} will load.
                </ModalHint>
              )}

              <NavButton
                type="button"
                onClick={handleLoadDevice}
                disabled={!device}
              >
                load device preset
              </NavButton>
            </>
          )}
        </ModalSection>
      </ModalCard>
    </ModalOverlay>
  );
};

export default PresetBrowser;
