import { Box, Button, ButtonGroup as MuiButtonGroup, Divider, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { BrowserStoreInstance } from "@weng-lab/genomebrowser";

type ButtonConfig = {
  label: string;
  onClick: (value: number) => void;
  value: number;
};

function ButtonGroup({ buttons }: { buttons: ButtonConfig[] }) {
  return (
    <MuiButtonGroup>
      {buttons.map((button) => (
        <Button
          key={`${button.label}-${button.value}`}
          variant="outlined"
          size="small"
          onClick={() => button.onClick(button.value)}
          sx={{ padding: "2px 8px", minWidth: 30, fontSize: "0.8rem" }}
        >
          {button.label}
        </Button>
      ))}
    </MuiButtonGroup>
  );
}

function TwoSidedControl({
  leftButtons,
  rightButtons,
  label,
  leftLabel,
  rightLabel,
}: {
  leftButtons: ButtonConfig[];
  rightButtons: ButtonConfig[];
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <Stack alignItems="center">
      {label ? <Typography variant="body2">{label}</Typography> : null}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Stack direction="column" alignItems="center">
          {leftLabel ? <Typography variant="body2">{leftLabel}</Typography> : null}
          <ButtonGroup buttons={leftButtons} />
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack direction="column" alignItems="center">
          {rightLabel ? <Typography variant="body2">{rightLabel}</Typography> : null}
          <ButtonGroup buttons={rightButtons} />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function ControlButtons({ browserStore }: { browserStore: BrowserStoreInstance }) {
  const domain = browserStore((state) => state.domain);
  const setDomain = browserStore((state) => state.setDomain);

  const zoom = useCallback(
    (factor: number) => {
      const width = domain.end - domain.start;
      const newWidth = Math.round(width * factor);
      const center = Math.round((domain.start + domain.end) / 2);
      const newStart = Math.max(0, Math.round(center - newWidth / 2));
      const newEnd = Math.round(center + newWidth / 2);

      setDomain({
        ...domain,
        start: newStart,
        end: newEnd,
      });
    },
    [domain, setDomain],
  );

  const shift = useCallback(
    (delta: number) => {
      const width = domain.end - domain.start;
      const newStart = Math.max(0, Math.round(domain.start + delta));
      const newEnd = Math.round(newStart + width);

      setDomain({
        ...domain,
        start: newStart,
        end: newEnd,
      });
    },
    [domain, setDomain],
  );

  const width = domain.end - domain.start;

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" gap={2}>
      <TwoSidedControl
        leftButtons={[
          { label: "◄◄◄", onClick: shift, value: -width },
          { label: "◄◄", onClick: shift, value: -Math.round(width / 2) },
          { label: "◄", onClick: shift, value: -Math.round(width / 4) },
        ]}
        rightButtons={[
          { label: "►", onClick: shift, value: Math.round(width / 4) },
          { label: "►►", onClick: shift, value: Math.round(width / 2) },
          { label: "►►►", onClick: shift, value: width },
        ]}
        label="Move"
      />
      <TwoSidedControl
        leftButtons={[
          { label: "1.5x", onClick: zoom, value: 1 / 1.5 },
          { label: "3x", onClick: zoom, value: 1 / 3 },
          { label: "10x", onClick: zoom, value: 1 / 10 },
        ]}
        rightButtons={[
          { label: "10x", onClick: zoom, value: 10 },
          { label: "3x", onClick: zoom, value: 3 },
          { label: "1.5x", onClick: zoom, value: 1.5 },
        ]}
        leftLabel="Zoom In"
        rightLabel="Zoom Out"
      />
    </Box>
  );
}
