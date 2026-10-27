import { FormControlLabel, Switch, Typography } from "@mui/material";
import { QC_GROUP, type SampleGroups } from "@/common/sampleFields/fields";
import type { SampleTableState } from "@/common/sampleFields/useSampleTable";

type HeatmapQcToggleProps<R extends SampleGroups> = {
  table: SampleTableState<R>;
};

/**
 * Shows or hides a heatmap's QC / reference columns. For a plot's header, beside a
 * HeatmapScaleToggle. It writes the table's filters, as QC's chip does on a scatter plot's legend,
 * so the table lists what the heatmap draws. A page starts with them hidden by passing QC_HIDDEN.
 * Where the heatmap draws no QC sample there's nothing to switch, so it isn't shown.
 */
const HeatmapQcToggle = <R extends SampleGroups>({ table }: HeatmapQcToggleProps<R>) =>
  table.plotted.some(({ qc }) => qc) ? (
    <FormControlLabel
      // Not MUI's form margins, which pull it 11px left into the scale toggle - OmeHeatmapShell spaces them.
      sx={{ mx: 0 }}
      control={
        <Switch size="small" checked={!table.filters.hideQc} onChange={() => table.toggleFilter("status", QC_GROUP)} />
      }
      label={
        <Typography variant="body2" noWrap>
          Show QC / reference
        </Typography>
      }
    />
  ) : null;

export default HeatmapQcToggle;
