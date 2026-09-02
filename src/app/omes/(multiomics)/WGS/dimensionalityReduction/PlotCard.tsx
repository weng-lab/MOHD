"use client";

import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode, RefObject } from "react";
import { CARD_SX } from "./dimensions";
import type { ColorField, ColorOption } from "./fields";
import type { GroupInfo } from "./groups";
import PlotLegend from "./PlotLegend";

/**
 * Generic over the color-by field rather than the row type: the row never
 * reaches this component, and the three props below are the only ones that have
 * to agree with each other.
 */
export type PlotCardProps<K extends ColorField> = {
  /** Cohort name, shown in the header. */
  title: string;
  /** Sample count for the cohort, shown beside the title. */
  count: number;
  /** Fields this cohort can be colored by. */
  options: readonly ColorOption<K>[];
  colorBy: K;
  onColorByChange: (key: K) => void;
  groups: GroupInfo[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Group to highlight in the legend, from either direction. */
  highlighted: string | null;
  /** Fired as the cursor enters and leaves a legend chip. */
  onHover: (value: string | null) => void;
  /** Measured by the parent so both plots can be given one shared size. */
  plotRef: RefObject<HTMLDivElement | null>;
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
const PlotCard = <K extends ColorField,>({
  title,
  count,
  options,
  colorBy,
  onColorByChange,
  groups,
  hidden,
  onToggle,
  highlighted,
  onHover,
  plotRef,
  children,
}: PlotCardProps<K>) => (
  <Paper
    variant="outlined"
    sx={{
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
      borderRadius: 2,
      ...CARD_SX,
    }}
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
        onChange={(e) => onColorByChange(e.target.value as K)}
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
      <PlotLegend
        groups={groups}
        hidden={hidden}
        onToggle={onToggle}
        highlighted={highlighted}
        onHover={onHover}
      />
      {/*
        Bottom-aligned, not centred. Both plots render at the smaller of the two containers, so
        the card with the shorter legend has room to spare below its plot. Pinning the plot to
        the bottom puts both x-axes on the same line, which is what makes the two cohorts
        readable side by side.
      */}
      <Box
        ref={plotRef}
        flex={1}
        minHeight={0}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
      >
        {children}
      </Box>
    </Stack>
  </Paper>
);

export default PlotCard;
