"use client";

import { FilterListOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  FormLabel,
  ListSubheader,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import { getOmeLabel } from "@/app/omes/omeContent";
import { PANEL_SX } from "./ExplorerLayout";
import { colorOptionsFor, labelOf, type ColorBy, type Field } from "./fields";
import { EXPLORER_OMES, METHODS, OME_CAPABILITIES, PC_COUNT, pcLabel, type Method } from "./omes";
import { toggleHidden, type ExplorerState } from "./params";

const PC_CHOICES = Array.from({ length: PC_COUNT }, (_, i) => i + 1);

const SELECT_SLOT_PROPS = { select: { MenuProps: { disableScrollLock: true } } };

/** One selected at a time, and filled, so the current ome reads at a glance. */
const omeButtonSx: SxProps<Theme> = {
  textTransform: "none",
  lineHeight: 1.3,
  color: "primary.main",
  borderColor: "primary.main",
  "&.Mui-selected, &.Mui-selected:hover": { color: "primary.contrastText", bgcolor: "primary.main" },
};

/**
 * Styled like the download page's filters - outlined, dimmed when off - but inverted: every value
 * starts on and a click hides it, rather than starting off and a click narrowing to it. That makes
 * a value switched off here the same state as its chip struck through in the legend, so it is
 * struck through here too.
 */
const filterButtonSx: SxProps<Theme> = {
  textTransform: "none",
  lineHeight: 1.5,
  py: 0.25,
  px: 1,
  color: "primary.main",
  borderColor: "primary.main",
  opacity: 0.5,
  textDecoration: "line-through",
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "primary.main",
    bgcolor: "transparent",
    opacity: 1,
    textDecoration: "none",
  },
};

/**
 * A heading inside a select's menu. Select stamps role="option" and aria-selected onto every child
 * it is given, which would announce a ListSubheader as one more choice; taking only `children`
 * drops those, and aria-hidden keeps the heading out of the options a screen reader counts - the
 * choices beneath it name themselves. The static flag is what MenuList reads to step past it with
 * the arrow keys.
 */
const MenuHeading = ({ children }: { children: ReactNode }) => <ListSubheader aria-hidden>{children}</ListSubheader>;
MenuHeading.muiSkipListHighlight = true;

const Section = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <Stack gap={1}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" minHeight={30}>
      <Typography variant="overline" color="text.secondary" lineHeight={1.5}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Stack>
);

type PcSelectProps = {
  label: string;
  value: number;
  /** The other axis's PC, which this one can't also take. */
  other: number;
  pve: readonly (number | null)[];
  onChange: (pc: number) => void;
};

/**
 * The menu lists each PC with its variance, to show which are worth picking. The field itself shows
 * the bare PC - the axis label beside the plot already carries the percentage, and the two selects
 * share a 300px panel.
 */
const PcSelect = ({ label, value, other, pve, onChange }: PcSelectProps) => (
  <TextField
    select
    size="small"
    fullWidth
    label={label}
    value={value}
    onChange={(event) => onChange(Number(event.target.value))}
    slotProps={{ select: { ...SELECT_SLOT_PROPS.select, renderValue: (pc) => `PC${pc}` } }}
  >
    {PC_CHOICES.map((pc) => (
      <MenuItem key={pc} value={pc} disabled={pc === other}>
        {pcLabel(pc, pve)}
      </MenuItem>
    ))}
  </TextField>
);

export type ControlPanelProps = {
  state: ExplorerState;
  onChange: (state: ExplorerState) => void;
  pve: readonly (number | null)[];
  /** Each offered field's values on the current ome, in display order. */
  options: Partial<Record<Field, string[]>>;
  /** Whether the current ome has QC samples, and so whether their switch is shown. */
  hasQc: boolean;
};

const ControlPanel = ({ state, onChange, pve, options, hasQc }: ControlPanelProps) => {
  const { ome, method, x, y, color, hideQc } = state;
  const { umap } = OME_CAPABILITIES[ome];
  const { fields, metrics } = colorOptionsFor(ome);
  const filtered = hideQc || Object.values(state.hidden).some((values) => values.length > 0);

  const update = (patch: Partial<ExplorerState>) => onChange({ ...state, ...patch });

  return (
    <Paper variant="outlined" sx={{ ...PANEL_SX, borderRadius: 2, p: 2 }}>
      <Stack gap={2}>
        <Box>
          <Typography variant="h6" component="h1" fontWeight={700}>
            Dimensionality Reduction
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sample structure across MOHD sequencing and molecular profiling data.
          </Typography>
        </Box>

        <Section title="Ome">
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.75}>
            {EXPLORER_OMES.map((option) => (
              <ToggleButton
                key={option}
                value={option}
                size="small"
                selected={option === ome}
                onChange={() => update({ ome: option })}
                sx={omeButtonSx}
              >
                {getOmeLabel(option)}
              </ToggleButton>
            ))}
          </Box>
        </Section>

        <Section title="Method">
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            color="primary"
            value={method}
            onChange={(_, value: Method | null) => value && update({ method: value })}
            aria-label="Method"
          >
            {METHODS.map((option) => (
              <ToggleButton key={option} value={option} disabled={option === "UMAP" && !umap}>
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {!umap && (
            <Typography variant="caption" color="text.secondary">
              PCA is the only reduction available for {getOmeLabel(ome)}.
            </Typography>
          )}
          {method === "PCA" && (
            <Stack direction="row" gap={1} mt={0.5}>
              <PcSelect label="X axis" value={x} other={y} pve={pve} onChange={(pc) => update({ x: pc })} />
              <PcSelect label="Y axis" value={y} other={x} pve={pve} onChange={(pc) => update({ y: pc })} />
            </Stack>
          )}
        </Section>

        <Section title="Color">
          <TextField
            select
            size="small"
            fullWidth
            label="Color by"
            value={color}
            onChange={(event) => update({ color: event.target.value as ColorBy })}
            slotProps={SELECT_SLOT_PROPS}
          >
            {fields.map(({ key, label }) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
            {/* Headed apart from the fields: these color along a ramp, and have no filters below. */}
            {metrics.length > 0 && <MenuHeading>{getOmeLabel(ome)} quality</MenuHeading>}
            {metrics.map(({ key, label }) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Section>

        <Divider />

        <Section
          title="Filter samples"
          action={
            <Button
              size="small"
              startIcon={<FilterListOff fontSize="small" />}
              disabled={!filtered}
              onClick={() => update({ hidden: {}, hideQc: false })}
            >
              Reset
            </Button>
          }
        >
          <Typography variant="caption" color="text.secondary">
            Click a value to hide or show its samples. Filters carry over as you switch omes.
          </Typography>
          {fields.map(({ key, label }) => {
            const hidden = new Set(state.hidden[key] ?? []);
            return (
              <Box key={key}>
                <FormLabel sx={{ display: "block", fontSize: 13, mb: 0.5 }}>{label}</FormLabel>
                <Box display="flex" flexWrap="wrap" gap={0.75} role="group" aria-label={`${label} filter`}>
                  {(options[key] ?? []).map((value) => (
                    <ToggleButton
                      key={value}
                      value={value}
                      size="small"
                      selected={!hidden.has(value)}
                      onChange={() => onChange(toggleHidden(state, key, value))}
                      sx={filterButtonSx}
                    >
                      {labelOf(key, value)}
                    </ToggleButton>
                  ))}
                </Box>
              </Box>
            );
          })}
          {hasQc && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={!hideQc}
                  onChange={(event) => update({ hideQc: !event.target.checked })}
                />
              }
              label={<Typography variant="body2">Show QC / reference samples</Typography>}
            />
          )}
        </Section>
      </Stack>
    </Paper>
  );
};

export default ControlPanel;
