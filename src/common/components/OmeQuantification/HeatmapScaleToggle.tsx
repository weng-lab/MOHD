import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { HEATMAP_SCALE_LABELS, HeatmapScaleMode } from "./heatmapColorScale";

type HeatmapScaleToggleProps = {
  modes: HeatmapScaleMode[];
  value: HeatmapScaleMode;
  onChange: (mode: HeatmapScaleMode) => void;
  /** The scale's caption, beside the toggle - see HeatmapColorScale. */
  caption: string;
};

const HeatmapScaleToggle = ({ modes, value, onChange, caption }: HeatmapScaleToggleProps) => (
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
        <ToggleButton key={mode} value={mode}>
          {HEATMAP_SCALE_LABELS[mode]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    <Typography variant="caption" color="text.secondary" sx={{ flex: "1 1 280px" }}>
      {caption}
    </Typography>
  </Stack>
);

export default HeatmapScaleToggle;
