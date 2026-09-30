import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { HEATMAP_SCALES, HeatmapScaleMode } from "./heatmapColorScale";

type HeatmapScaleToggleProps = {
  modes: HeatmapScaleMode[];
  value: HeatmapScaleMode;
  onChange: (mode: HeatmapScaleMode) => void;
};

/**
 * Switches the heatmap's color scale, each named by its formula. For a plot's header. Where every
 * option is z-scored, "Z-score" labels the group once rather than every button; otherwise each
 * z-scored button says so itself, as its formula alone would match an unscored one's.
 */
const HeatmapScaleToggle = ({ modes, value, onChange }: HeatmapScaleToggleProps) => {
  const allZScored = modes.every((mode) => HEATMAP_SCALES[mode].zScored);

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      {allZScored && (
        <Typography variant="body2" color="text.secondary" noWrap>
          Z-score
        </Typography>
      )}
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={value}
        onChange={(_, mode: HeatmapScaleMode | null) => mode && onChange(mode)}
        aria-label={allZScored ? "Z-score of" : "Color scale"}
        // White against the header's shading.
        sx={{ bgcolor: "background.paper" }}
      >
        {modes.map((mode) => {
          const { formula, zScored } = HEATMAP_SCALES[mode];
          return (
            // Not uppercased, so the formula reads as written.
            <ToggleButton key={mode} value={mode} sx={{ textTransform: "none" }}>
              {zScored && !allZScored ? `Z-score: ${formula}` : formula}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Stack>
  );
};

export default HeatmapScaleToggle;
