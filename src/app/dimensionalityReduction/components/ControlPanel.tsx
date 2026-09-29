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
import { PANEL_SX } from "./dimensions";
import { FEATURE_KINDS, isFeatureColor } from "../model/features";
import { colorOptionsFor, type ColorBy } from "../model/colorBy";
import { labelOf, type Field } from "@/common/sampleFields/fields";
import GeneSearch from "./GeneSearch";
import { rowsFor, allRows } from "../model/rows";
import { valuesOf } from "@/common/sampleFields/groups";
import { EXPLORER_OMES, METHODS, OME_CAPABILITIES, PC_COUNT, pcLabel, type Method } from "../model/omes";
import { switchOme, toggleHidden, type ExplorerState } from "../state/params";
import QuantificationSearch from "./QuantificationSearch";
import { NO_SHAPE, shapeOptions, type ShapeBy } from "@/common/sampleFields/shapes";
import type { ExplorerData } from "../model/types";

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
 * Styled like the download page's filters, but inverted: every value starts on, and a click fades
 * its samples. Struck through when off, like its chip in the legend.
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
 * A heading inside a select's menu. Takes only `children`, dropping the role="option" Select stamps
 * on every child, and is aria-hidden; `muiSkipListHighlight` makes the arrow keys skip it.
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

/** The menu lists each PC with its variance; the field shows the bare PC, as the axis label has the percentage. */
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
  /**
   * Every ome's data, from which the panel works out its own choices. Worked out in the explorer,
   * they shared a React Compiler memo block with the plot's colors and re-rendered the panel on
   * every step of a color-range drag.
   */
  data: ExplorerData;
  /** The gene coloring the plot, shown beneath the search, which clears its own input after each pick. */
  geneLabel: string | null;
};

const ControlPanel = ({ state, onChange, data, geneLabel }: ControlPanelProps) => {
  const { ome, method, x, y, color, shape, hideQc } = state;
  const { umap } = OME_CAPABILITIES[ome];
  const { fields, metrics, feature } = colorOptionsFor(ome);
  const { pve } = data[ome];
  const features = data[ome].features ?? [];
  const rows = rowsFor(data, ome, method);
  const options: Partial<Record<Field, string[]>> = Object.fromEntries(
    fields.map(({ key }) => [key, valuesOf(rows, key)])
  );
  const shapeable = shapeOptions(fields, allRows(data));
  const hasQc = rows.some((row) => row.qc);
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
                onChange={() => onChange(switchOme(state, option))}
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

        <Section title="Encoding">
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
            {feature && <MenuItem value={FEATURE_KINDS[feature].color}>{FEATURE_KINDS[feature].option}</MenuItem>}
            {metrics.length > 0 && <MenuHeading>{getOmeLabel(ome)} quality</MenuHeading>}
            {metrics.map(({ key, label }) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {isFeatureColor(color) && feature === "gene" && (
            <Box>
              <GeneSearch onSelect={(gene) => update({ feature: gene })} />
              {geneLabel && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Selected: {geneLabel}
                </Typography>
              )}
            </Box>
          )}
          {isFeatureColor(color) && feature && feature !== "gene" && (
            <QuantificationSearch
              // Remounted per ome, since it holds its own value.
              key={ome}
              kind={feature}
              options={features}
              initial={state.feature}
              onSelect={(name) => update({ feature: name })}
            />
          )}
          <TextField
            select
            size="small"
            fullWidth
            label="Shape by"
            value={shape}
            onChange={(event) => update({ shape: event.target.value as ShapeBy })}
            slotProps={SELECT_SLOT_PROPS}
          >
            <MenuItem value={NO_SHAPE}>None</MenuItem>
            {/* Unshapeable fields are listed disabled with the reason, rather than silently missing. */}
            {fields.map(({ key, label }) => {
              const fits = shapeable.some((option) => option.key === key);
              return (
                <MenuItem key={key} value={key} disabled={!fits}>
                  {fits ? label : `${label} — too many values to shape by`}
                </MenuItem>
              );
            })}
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
            Click a value to fade its samples into the background. Filters carry over as you switch omes.
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
              label={<Typography variant="body2">Color QC / reference samples</Typography>}
            />
          )}
        </Section>
      </Stack>
    </Paper>
  );
};

export default ControlPanel;
