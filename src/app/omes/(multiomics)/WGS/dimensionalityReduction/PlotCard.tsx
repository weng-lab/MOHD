"use client";

import {
  Box,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode, RefObject } from "react";
import type { GroupInfo } from "./colors";
import PlotLegend from "./PlotLegend";
import type { ColorOption } from "./types";

export type PlotCardProps<T> = {
  /** Cohort name, shown in the header. */
  title: string;
  /** Sample count for the cohort, shown beside the title. */
  count: number;
  /** Fields this cohort can be coloured by. */
  options: ColorOption<T>[];
  colorBy: keyof T;
  onColorByChange: (key: keyof T) => void;
  groups: GroupInfo[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  sx?: SxProps<Theme>;
  /** Measured by the parent so both plots can be given one shared size. */
  plotRef?: RefObject<HTMLDivElement | null>;
  /** The plot itself. */
  children: ReactNode;
};

/**
 * One cohort's pane: header, legend and plot inside a single border.
 *
 * The "color by" select sits in the card header rather than in a page-level
 * toolbar. With both cohorts on screen a shared toolbar leaves the reader
 * matching each select to its plot by reading its label; inside the border
 * there is only one plot it can belong to, at every breakpoint. That also
 * lets the label shrink to "Color by" - the title beside it names the cohort.
 *
 * The axis selects stay outside this component for the same reason: they drive
 * both plots through ScatterPlotSync, so they must not sit inside either card.
 */
const PlotCard = <T,>({
  title,
  count,
  options,
  colorBy,
  onColorByChange,
  groups,
  hidden,
  onToggle,
  sx,
  plotRef,
  children,
}: PlotCardProps<T>) => (
  <Paper
    variant="outlined"
    sx={[
      {
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        borderRadius: 2,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1.5}
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: "surface.light",
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Typography variant="subtitle2" noWrap>
        {title}{" "}
        <Typography component="span" variant="body2" color="text.secondary">
          {/* Fixed locale: this renders on the server too, and the browser's own
              locale would separate the thousands differently and fail hydration. */}
          ({count.toLocaleString("en-US")})
        </Typography>
      </Typography>
      <TextField
        select
        size="small"
        label="Color by"
        value={String(colorBy)}
        onChange={(e) => onColorByChange(e.target.value as keyof T)}
        sx={{ minWidth: 200, flexShrink: 0, bgcolor: "background.paper" }}
      >
        {options.map((o) => (
          <MenuItem key={String(o.key)} value={String(o.key)}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>

    <Stack gap={1} sx={{ px: 1.5, pt: 1.25, pb: 1.5, flex: 1, minHeight: 0 }}>
      <PlotLegend groups={groups} hidden={hidden} onToggle={onToggle} />
      <Box ref={plotRef} flex={1} minHeight={0}>
        {children}
      </Box>
    </Stack>
  </Paper>
);

export default PlotCard;
