import { Box, ButtonGroup, Divider, Stack, Typography } from "@mui/material";
import type { BrowserStoreInstance } from "@weng-lab/genomebrowser";
import { BrowserNavigationButton, type BrowserNavigationAction } from "@weng-lab/genomebrowser-ui";

type NavButtonConfig = {
  label: string;
  ariaLabel: string;
  action: BrowserNavigationAction;
};

/** Pan fractions are signed and relative to the viewport span; zoom factors below 1 zoom in. */
const MOVE_LEFT: NavButtonConfig[] = [
  { label: "◄◄◄", ariaLabel: "Pan left one viewport", action: { type: "pan", fraction: -1 } },
  { label: "◄◄", ariaLabel: "Pan left half a viewport", action: { type: "pan", fraction: -0.5 } },
  { label: "◄", ariaLabel: "Pan left a quarter viewport", action: { type: "pan", fraction: -0.25 } },
];

const MOVE_RIGHT: NavButtonConfig[] = [
  { label: "►", ariaLabel: "Pan right a quarter viewport", action: { type: "pan", fraction: 0.25 } },
  { label: "►►", ariaLabel: "Pan right half a viewport", action: { type: "pan", fraction: 0.5 } },
  { label: "►►►", ariaLabel: "Pan right one viewport", action: { type: "pan", fraction: 1 } },
];

const ZOOM_IN: NavButtonConfig[] = [
  { label: "1.5x", ariaLabel: "Zoom in 1.5x", action: { type: "zoom", factor: 1 / 1.5 } },
  { label: "3x", ariaLabel: "Zoom in 3x", action: { type: "zoom", factor: 1 / 3 } },
  { label: "10x", ariaLabel: "Zoom in 10x", action: { type: "zoom", factor: 1 / 10 } },
];

const ZOOM_OUT: NavButtonConfig[] = [
  { label: "10x", ariaLabel: "Zoom out 10x", action: { type: "zoom", factor: 10 } },
  { label: "3x", ariaLabel: "Zoom out 3x", action: { type: "zoom", factor: 3 } },
  { label: "1.5x", ariaLabel: "Zoom out 1.5x", action: { type: "zoom", factor: 1.5 } },
];

function NavButtonGroup({
  buttons,
  useBrowserStore,
}: {
  buttons: NavButtonConfig[];
  useBrowserStore: BrowserStoreInstance;
}) {
  return (
    <ButtonGroup>
      {buttons.map((button) => (
        <BrowserNavigationButton
          key={button.ariaLabel}
          action={button.action}
          browserStore={useBrowserStore}
          aria-label={button.ariaLabel}
          variant="outlined"
          size="small"
          sx={{ padding: "2px 8px", minWidth: 30, fontSize: "0.8rem" }}
        >
          {button.label}
        </BrowserNavigationButton>
      ))}
    </ButtonGroup>
  );
}

function TwoSidedControl({
  leftButtons,
  rightButtons,
  label,
  leftLabel,
  rightLabel,
  useBrowserStore,
}: {
  leftButtons: NavButtonConfig[];
  rightButtons: NavButtonConfig[];
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  useBrowserStore: BrowserStoreInstance;
}) {
  return (
    <Stack alignItems="center">
      {label ? <Typography variant="body2">{label}</Typography> : null}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Stack direction="column" alignItems="center">
          {leftLabel ? <Typography variant="body2">{leftLabel}</Typography> : null}
          <NavButtonGroup buttons={leftButtons} useBrowserStore={useBrowserStore} />
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack direction="column" alignItems="center">
          {rightLabel ? <Typography variant="body2">{rightLabel}</Typography> : null}
          <NavButtonGroup buttons={rightButtons} useBrowserStore={useBrowserStore} />
        </Stack>
      </Stack>
    </Stack>
  );
}

/**
 * Pan and zoom controls. Each button is store-bound, so it reads the current
 * region on activation and disables itself at the chromosome edges and zoom
 * limits — no region subscription or hand-rolled coordinate math here.
 */
export default function ControlButtons({ useBrowserStore }: { useBrowserStore: BrowserStoreInstance }) {
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" gap={2}>
      <TwoSidedControl
        leftButtons={MOVE_LEFT}
        rightButtons={MOVE_RIGHT}
        label="Move"
        useBrowserStore={useBrowserStore}
      />
      <TwoSidedControl
        leftButtons={ZOOM_IN}
        rightButtons={ZOOM_OUT}
        leftLabel="Zoom In"
        rightLabel="Zoom Out"
        useBrowserStore={useBrowserStore}
      />
    </Box>
  );
}
