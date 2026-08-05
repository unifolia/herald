import styled, { css } from "styled-components";
import { HexColorInput } from "react-colorful";
import { theme } from "./theme";
import { BaseButton } from "./GlobalStyles";
import type { Layout } from "../types";

// Media query boundaries. Each breakpoint has a single transition point:
// `from(bp)` matches at the breakpoint and wider; `below(bp)` matches strictly
// narrower. The 0.02px offset keeps the two mutually exclusive without leaving
// a fractional-pixel dead zone (e.g. at 1080.5px under browser zoom / HiDPI),
// so always pair `from`/`below` on the same breakpoint rather than hand-writing
// `min-width`/`max-width` with a `+1px` offset.
const from = (bp: string) => `@media (min-width: ${bp})`;
const below = (bp: string) => `@media (max-width: calc(${bp} - 0.02px))`;

const rowWide = (styles: ReturnType<typeof css>) => css`
  [data-layout="row"] & {
    ${from(theme.breakpoints.rowStack)} {
      ${styles}
    }
  }
`;

const rowWideSelf = (styles: ReturnType<typeof css>) => css`
  &[data-layout="row"] {
    ${from(theme.breakpoints.rowStack)} {
      ${styles}
    }
  }
`;

const tileWide = (styles: ReturnType<typeof css>) => css`
  [data-layout="tile"] & {
    ${from(theme.breakpoints.narrow)} {
      ${styles}
    }
  }
`;

const tileWideSelf = (styles: ReturnType<typeof css>) => css`
  &[data-layout="tile"] {
    ${from(theme.breakpoints.narrow)} {
      ${styles}
    }
  }
`;

const narrowStacked = (styles: ReturnType<typeof css>) => css`
  ${below(theme.breakpoints.narrow)} {
    ${styles}
  }

  [data-layout="row"] & {
    ${below(theme.breakpoints.rowStack)} {
      ${styles}
    }
  }
`;

const narrowStackedSelf = (styles: ReturnType<typeof css>) => css`
  ${below(theme.breakpoints.narrow)} {
    ${styles}
  }

  &[data-layout="row"] {
    ${below(theme.breakpoints.rowStack)} {
      ${styles}
    }
  }
`;

const inlineSelectWide = css`
  flex: 0 0 auto;
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.sm};

  select {
    flex: 0 0 auto;
    min-width: 0;
  }
`;

const inlineSelectNarrow = css`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: ${theme.spacing.xs};

  select {
    flex: 1 1 auto;
    width: auto;
    min-width: 62px;
    max-width: 130px;
  }
`;

const headerControlHeight = "32px";
const dragHandleWidth = "28px";
const removeButtonSize = headerControlHeight;
const formTitleHeight = headerControlHeight;
const tileSlotHeight = "40px";

const stackedRangeBox = css`
  height: ${tileSlotHeight};
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const tileColumnBreakpoints = {
  three: "858px",
  four: "1128px",
} as const;

export const NavBar = styled.nav`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: var(--shadow-nav);

  ${below(theme.breakpoints.rowStack)} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
  }
`;

export const NavButton = styled(BaseButton)`
  min-width: 100px;
`;

export const AdvancedModeButton = styled(NavButton)`
  &[aria-pressed="true"] {
    border-color: var(--primary);
    background: var(--surface-hover-strong);
    box-shadow: var(--shadow-button);
    color: var(--text-primary);
  }

  &[aria-pressed="true"]:hover {
    border-color: var(--remove-hover);
    background: var(--surface-hover-strong);
    box-shadow: var(--shadow-button);
    color: var(--remove-hover);
  }
`;

export const LayoutButton = styled(NavButton)`
  ${below(theme.breakpoints.narrow)} {
    display: none;
  }
`;

export const GlobalChannelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

export const ThemeToggleButton = styled(BaseButton)`
  min-width: 72px;
  padding: 0.4rem ${theme.spacing.sm};
  font-size: ${theme.fonts.sizes.label};
  background: var(--surface-glass);
`;

// Form Components
export const FormsContainer = styled.div<{ $layout?: Layout }>`
  width: 100%;
  min-width: 0;

  ${({ $layout }) =>
    $layout === "row"
      ? css`
          display: flex;
          flex-direction: column;
          gap: 5px;

          ${below(theme.breakpoints.rowStack)} {
            gap: ${theme.spacing.lg};
          }

          ${from(theme.breakpoints.huge)} {
            flex-direction: row;
            flex-wrap: wrap;

            & > * {
              flex: 0 0 calc(50% - 2.5px);
              min-width: 0;
              max-width: calc(50% - 2.5px);
            }
          }
        `
      : css`
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          grid-auto-rows: 1fr;
          gap: ${theme.spacing.md};
          justify-content: start;

          ${below(theme.breakpoints.narrow)} {
            gap: ${theme.spacing.lg};
          }

          ${from(theme.breakpoints.narrow)} {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          ${from(tileColumnBreakpoints.three)} {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          ${from(tileColumnBreakpoints.four)} {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          ${from(theme.breakpoints.big)} {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }

          ${from(theme.breakpoints.huge)} {
            grid-template-columns: repeat(8, minmax(0, 1fr));
          }
        `}
`;

export const MidiFormContainer = styled.div`
  box-sizing: border-box;
  background: var(--surface-glass);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.md};
  box-shadow: var(--shadow-glass);
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;

  ${tileWideSelf(css`
    padding: ${theme.spacing.xs};
  `)}

  &:hover {
    box-shadow: var(--shadow-glass-hover);
    border-color: var(--primary-alpha-30);
  }

  ${rowWideSelf(css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: 0.45rem ${theme.spacing.sm};
  `)}

  ${narrowStackedSelf(css`
    padding: 0.5rem;
  `)}
`;

export const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 0;
  margin-bottom: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid var(--surface-glass-border);

  ${tileWide(css`
    gap: 0.25rem;
  `)}

  ${rowWide(css`
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
    flex: 0 0 auto;
    gap: ${theme.spacing.sm};
  `)}

  ${narrowStacked(css`
    margin-bottom: ${theme.spacing.md};
  `)}
`;

export const FormHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex: 1;
  min-width: 0;

  ${tileWide(css`
    gap: 0.25rem;
  `)}

  ${rowWide(css`
    flex: 0 0 auto;
  `)}
`;

export const DragHandleButton = styled.button<{ $dotColor?: string }>`
  --drag-handle-dot-color: var(--text-primary);

  width: ${dragHandleWidth};
  height: ${headerControlHeight};
  min-width: ${dragHandleWidth};
  display: grid;
  place-items: center;
  padding: 0;
  background: var(--surface-subtle);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.md};
  cursor: grab;
  touch-action: none;
  transition: ${theme.transitions.default};
  color: var(--text-secondary);

  &::before {
    content: "";
    width: 12px;
    height: 18px;
    background:
      radial-gradient(
        circle at 2px 2px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      ),
      radial-gradient(
        circle at 10px 2px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      ),
      radial-gradient(
        circle at 2px 9px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      ),
      radial-gradient(
        circle at 10px 9px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      ),
      radial-gradient(
        circle at 2px 16px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      ),
      radial-gradient(
        circle at 10px 16px,
        var(--inset-highlight-strong) 0 0.8px,
        var(--drag-handle-dot-color) 1px 2px,
        transparent 2.2px
      );
  }

  &:hover {
    background: var(--primary-alpha-5);
    border-color: var(--surface-glass-border);
    color: var(--title-hover);
  }

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const FormTitleDisplay = styled.h3`
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0 ${theme.spacing.xs};
  font-size: 14px;
  line-height: calc(${formTitleHeight} - 2px);
  min-height: ${formTitleHeight};
  font-weight: ${theme.fonts.weights.normal};
  color: var(--text-primary);
  text-transform: lowercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.default};
  background: var(--surface-subtle);
  border: 1px solid transparent;
  box-sizing: border-box;
  text-align: center;

  [data-layout] & {
    height: ${formTitleHeight};
    max-height: ${formTitleHeight};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background: var(--primary-alpha-5);
    border-color: var(--surface-glass-border);
    color: var(--title-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  &.header {
    font-size: 1.8rem;
    line-height: 1.4;
    min-height: 2.55rem;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
  }

  ${rowWide(css`
    flex: 0 0 250px;
    width: 250px;
    box-sizing: border-box;

    ${from(theme.breakpoints.huge)} {
      flex-basis: 150px;
      width: 150px;
    }
  `)}
`;

export const FormTitleInput = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: ${formTitleHeight};
  min-height: ${formTitleHeight};
  padding: 0 ${theme.spacing.xs};
  font-size: 14px;
  line-height: 1.2;
  font-weight: ${theme.fonts.weights.normal};
  font-family: inherit;
  color: var(--text-primary);
  background: var(--primary-alpha-8);
  border: 1px solid var(--primary);
  border-radius: ${theme.borderRadius.md};
  outline: none;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  text-align: center;

  &.header {
    height: auto;
    font-size: 1.8rem;
    line-height: 1.4;
    min-height: 2.55rem;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
  }

  ${rowWide(css`
    flex: 0 0 250px;
    width: 250px;

    ${from(theme.breakpoints.huge)} {
      flex-basis: 150px;
      width: 150px;
    }
  `)}
`;

export const RemoveButton = styled.button`
  width: ${removeButtonSize};
  height: ${removeButtonSize};
  min-width: ${removeButtonSize};
  padding: 0;
  position: relative;
  background: var(--surface-subtle);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14px;
    height: 1.5px;
    background: var(--text-secondary);
    border-radius: 1px;
    transition: background ${theme.transitions.default};
    transform-origin: center;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &:hover {
    background: var(--danger-alpha-10);
    border-color: var(--danger-alpha-30);

    &::before,
    &::after {
      background: var(--remove-hover);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  &[data-placement="end"] {
    display: none;
  }

  ${rowWide(css`
    &[data-placement="end"] {
      display: inline-block;
    }

    &[data-placement="header"] {
      display: none;
    }
  `)}
`;

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  ${rowWide(css`
    margin-bottom: 0;
    flex: 1 1 0;
    min-width: 0;
  `)}

  ${narrowStacked(css`
    margin-bottom: 0;
  `)}

  &:has(input[type="range"]) {
    ${narrowStacked(stackedRangeBox)}
  }

  ${tileWide(css`
    &:has(input[type="range"]) {
      min-height: ${tileSlotHeight};
    }
  `)}

  [data-layout="row"] &:has(input[type="range"]) {
    ${from(theme.breakpoints.rowStack)} {
      min-width: 140px;
    }
  }

  [data-layout="row"] &:has(select) {
    ${from(theme.breakpoints.rowStack)} {
      ${inlineSelectWide}
    }

    ${below(theme.breakpoints.rowStack)} {
      ${inlineSelectNarrow}
    }
  }

  &:has(select) {
    ${below(theme.breakpoints.narrow)} {
      ${inlineSelectNarrow}
    }
  }
`;

export const FormClickable = styled.div`
  margin-top: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

export const ColorPicker = styled(FormGroup)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: ${theme.spacing.sm};
  margin-bottom: 0;
  position: relative;

  ${rowWide(css`
    margin-top: 0;
    padding-top: 0;
    margin-left: auto;
    flex: 0 0 auto;
    gap: ${theme.spacing.sm};
  `)}

  ${narrowStacked(css`
    padding-top: 0;
  `)}
`;

export const ColorSwatch = styled.button`
  width: 64px;
  height: 32px;
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  padding: 0;

  &:hover {
    border-color: var(--primary);
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const ColorPopover = styled.div`
  position: absolute;
  bottom: calc(100% + ${theme.spacing.sm});
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  background: var(--surface-popover);
  backdrop-filter: blur(20px);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  box-shadow: var(--shadow-glass);

  .react-colorful {
    width: 200px;
    height: 160px;
  }

  .react-colorful__saturation {
    border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  }

  .react-colorful__hue {
    border-radius: 0 0 ${theme.borderRadius.md} ${theme.borderRadius.md};
  }

  .react-colorful__saturation-pointer,
  .react-colorful__hue-pointer {
    width: 16px;
    height: 16px;
  }
`;

export const HexInput = styled(HexColorInput)`
  width: 200px;
  box-sizing: border-box;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-family: inherit;
  font-size: ${theme.fonts.sizes.label};
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
  color: var(--text-primary);
  background: var(--surface-input);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.md};
  outline: none;
  transition: ${theme.transitions.default};

  &:hover {
    border-color: var(--primary);
  }

  &:focus {
    border-color: var(--primary);
    background: var(--primary-alpha-8);
  }
`;

export const FormLabel = styled.label`
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.2;
  font-weight: ${theme.fonts.weights.normal};
  text-transform: lowercase;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: "";
    width: 4px;
    height: 4px;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: none;
  }
`;

export const Select = styled.select`
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--surface-input);
  background-image: var(--select-caret);
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.sm} center;
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0.55rem 1.6rem 0.55rem 0.7rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: ${theme.fonts.sizes.label};
  cursor: pointer;

  &:hover {
    border-color: var(--primary);
    background-color: var(--surface-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    background-color: var(--primary-alpha-8);
  }

  option {
    background: var(--surface-dark);
    color: var(--text-primary);
    padding: ${theme.spacing.xs};
  }

  ${rowWide(css`
    padding: 0.35rem ${theme.spacing.lg} 0.35rem ${theme.spacing.sm};
    font-size: ${theme.fonts.sizes.label};
    width: 65px;
  `)}

  ${narrowStacked(css`
    padding: 0.35rem ${theme.spacing.lg} 0.35rem ${theme.spacing.md};
  `)}
`;

export const RangeInput = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: var(--range-track);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  position: relative;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: var(--range-thumb);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--shadow-range-thumb);
    transition: ${theme.transitions.default};

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-range-thumb-hover);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: var(--range-thumb);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-range-thumb);
    transition: ${theme.transitions.default};

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-range-thumb-hover);
    }
  }
`;

export const DeviceSelect = styled(Select)`
  min-width: 80px;
  max-width: 316px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GlobalChannelLabel = styled(FormLabel)`
  font-size: ${theme.fonts.sizes.body};
  color: var(--text-primary);
  white-space: nowrap;

  &::before {
    display: none;
  }
`;

export const GlobalChannelSelect = styled(Select)`
  align-self: stretch;
  min-width: 80px;

  ${below(theme.breakpoints.rowStack)} {
    min-height: 0;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    font-size: ${theme.fonts.sizes.body};
  }

  ${from(theme.breakpoints.rowStack)} {
    width: 65px;
    min-width: 0;
  }
`;

export const SendButton = styled(BaseButton)`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 100px;
  font-weight: ${theme.fonts.weights.medium};
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0;
  margin-bottom: ${theme.spacing.sm};
  align-self: center;

  ${tileWide(css`
    height: ${tileSlotHeight};
    padding: 0 ${theme.spacing.md};
  `)}

  ${rowWide(css`
    margin-top: 0;
    margin-bottom: 0;
    width: auto;
    flex: 0 0 auto;
    padding: 0.35rem ${theme.spacing.md};
    font-size: ${theme.fonts.sizes.label};
    min-width: auto;
  `)}

  ${narrowStacked(css`
    ${stackedRangeBox}
    padding: 0 ${theme.spacing.md};
    font-size: ${theme.fonts.sizes.label};
  `)}

  &.sent {
    color: var(--primary);
    border-color: var(--primary);
    animation: send-pulse 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes send-pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 var(--primary-alpha-30);
    }
    40% {
      transform: scale(1.06);
      box-shadow: 0 0 0 8px transparent;
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 transparent;
    }
  }
`;

export const DeviceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};

  ${below(theme.breakpoints.rowStack)} {
    flex-direction: column;
  }
`;

export const DeviceHeading = styled.h2`
  margin: 0;
`;

export const FooterText = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  font-size: 1.25rem;
`;

export const SelectRow = styled.div`
  display: contents;

  ${tileWide(css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};
  `)}

  [data-layout="tile"] & > ${FormGroup} {
    ${from(theme.breakpoints.narrow)} {
      margin-bottom: 0;
    }
  }

  ${narrowStacked(css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: ${theme.spacing.sm};

    & > * {
      flex: 0 1 auto;
      min-width: 0;
    }
  `)}
`;

// Load Preset modal
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  background: rgba(7, 5, 3, 0.55);
  backdrop-filter: blur(4px);
`;

export const ModalCard = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: calc(380px - 2 * ${theme.spacing.md});
  max-width: 460px;
  max-height: calc(100vh - 2 * ${theme.spacing.xl});
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: var(--surface-popover);
  border: 1px solid var(--surface-glass-border);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: var(--shadow-glass-hover);
`;

export const ModalHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  text-align: center;
  font-size: ${theme.fonts.sizes.h2};
  font-weight: ${theme.fonts.weights.thin};
  text-transform: lowercase;
  letter-spacing: 0.05em;
  background: var(--text-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: var(--shadow-text-glow);
`;

export const ModalCloseButton = styled(RemoveButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

export const ModalSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const ModalSectionTitle = styled.h3`
  margin: 0 0 0.5rem;
  text-align: center;
  font-size: ${theme.fonts.sizes.form};
  font-weight: ${theme.fonts.weights.medium};
`;

export const ModalHint = styled.p`
  margin: 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: ${theme.fonts.sizes.label};
`;

export const ModalDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: var(--text-secondary);
  font-size: ${theme.fonts.sizes.label};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--surface-glass-border);
  }
`;

export const ModalField = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fonts.sizes.label};
  color: var(--text-secondary);
`;

export const ModalSelect = styled(Select)`
  box-sizing: border-box;
  width: 100%;
  max-width: none;
`;

export const ModalUploadButton = styled(NavButton).attrs({ as: "label" })`
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  input {
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
    top: 0;
    left: 0;
    cursor: pointer;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

export const AdvancedModalActions = styled(ModalActions)`
  flex-direction: column;
  align-items: stretch;
`;
