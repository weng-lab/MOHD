import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { HEATMAP_SCALE_LABELS, HeatmapScaleMode } from "./heatmapColorScale";

type HeatmapScaleToggleProps = {
  modes: HeatmapScaleMode[];
  value: HeatmapScaleMode;
  onChange: (mode: HeatmapScaleMode) => void;
};

/** Switches the heatmap's color scale, each named by its formula. */

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
        // Not uppercased, so the formula reads as written.
        <ToggleButton key={mode} value={mode} sx={{ textTransform: "none" }}>
          {HEATMAP_SCALE_LABELS[mode]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Stack>
);

export default HeatmapScaleToggle;
