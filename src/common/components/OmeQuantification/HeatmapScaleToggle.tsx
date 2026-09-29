import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { HEATMAP_SCALE_LABELS, HeatmapScaleMode } from "./heatmapColorScale";

type HeatmapScaleToggleProps = {
  modes: HeatmapScaleMode[];
  value: HeatmapScaleMode;
  onChange: (mode: HeatmapScaleMode) => void;
};

/** Switches the heatmap's color scale, each named by its formula. For a plot's header. */
const HeatmapScaleToggle = ({ modes, value, onChange }: HeatmapScaleToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    color="primary"
    value={value}
    onChange={(_, mode: HeatmapScaleMode | null) => mode && onChange(mode)}
    aria-label="Color scale"
    // White against the header's shading.
    sx={{ bgcolor: "background.paper" }}
  >
    {modes.map((mode) => (
      // Not uppercased, so the formula reads as written.
      <ToggleButton key={mode} value={mode} sx={{ textTransform: "none" }}>
        {HEATMAP_SCALE_LABELS[mode]}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

export default HeatmapScaleToggle;
