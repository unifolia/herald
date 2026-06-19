import { useMemo, useRef, useState, type ChangeEvent } from "react";
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
  ModalHint,
  ModalDivider,
  ModalField,
  ModalSelect,
  ModalUploadButton,
  NavButton,
} from "../styles/components";
import {
  fetchPresetCatalog,
  getCachedPresetCatalog,
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
  const [catalog, setCatalog] = useState<PresetCatalog | null>(
    getCachedPresetCatalog,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">(
    () => (getCachedPresetCatalog() ? "ready" : "idle"),
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

  useModalDismiss(cardRef, closeRef, onClose);

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

  return createPortal(
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
            <a href="https://www.openmidi.com/">openMIDI</a>&nbsp;project
          </ModalHint>
          {status === "idle" ? (
            <NavButton type="button" onClick={handlePullData}>
              pull data
            </NavButton>
          ) : status === "loading" ? (
            <ModalHint>loading device list…</ModalHint>
          ) : status === "failed" ? (
            <>
              <ModalHint>*openMIDI presets are currently unavailable*</ModalHint>
              <NavButton type="button" onClick={handlePullData}>
                try again
              </NavButton>
            </>
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
    </ModalOverlay>,
    document.body,
  );
};

export default PresetBrowser;
