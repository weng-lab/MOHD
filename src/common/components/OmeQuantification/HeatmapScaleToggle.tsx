import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { HEATMAP_SCALE_LABELS, HeatmapScaleMode } from "./heatmapColorScale";

type HeatmapScaleToggleProps = {
  modes: HeatmapScaleMode[];
  value: HeatmapScaleMode;
  onChange: (mode: HeatmapScaleMode) => void;
};

/**
 * The heatmap's color scales, each named by its formula. What a scale's colors span, and how many
 * cells lie beyond, is the colorbar's to say - see OmeHeatmapShell.
 */

const HeatmapScaleToggle = ({ modes, value, onChange }: HeatmapScaleToggleProps) => (
  <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" sx={{ pb: 1 }}>
    <ToggleButtonGroup
      exclusive
      size="small"
      color="primary"
      value={value}
      onChange={(_, mode: HeatmapScaleMode | null) => mode && onChange(mode)}
      aria-label="Color scale"
    >
      {modes.map((mode) => (
        // MUI's buttons are uppercase by default, which would make a formula read as LOG10(VALUE + 1).
        <ToggleButton key={mode} value={mode} sx={{ textTransform: "none" }}>
          {HEATMAP_SCALE_LABELS[mode]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Stack>
);

export default HeatmapScaleToggle;
