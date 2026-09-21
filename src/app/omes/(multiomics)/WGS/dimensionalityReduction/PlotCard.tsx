"use client";

import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type ReactNode, type RefObject } from "react";
import PlotLegend from "@/common/components/PlotLegend";
import { CARD_SX } from "./dimensions";
import type { ColorField, ColorOption } from "./fields";
import type { GroupInfo } from "./groups";

/**
 * Generic over the color-by field rather than the row type: the row never
 * reaches this component, and the three props below are the only ones that have
 * to agree with each other.
 */
export type PlotCardProps<K extends ColorField> = {
  /** Cohort name, shown in the header. */
  title: string;
  /** Samples in focus, shown beside the title. */
  shown: number;
  /** Samples on the plot, the dimmed ones included. Named beside `shown` only while the two differ. */
  total: number;
  /** Fields this cohort can be colored by. */
  options: readonly ColorOption<K>[];
  colorBy: K;
  onColorByChange: (key: K) => void;
  groups: GroupInfo[];
  hidden: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Measured by the parent so both plots can be given one shared size. */
  plotRef: RefObject<HTMLDivElement | null>;
  /**
   * The plot, built for the hover this card is tracking: `legendHover` is the group whose chip is
   * under the cursor, which the plot renders as `hoveredPoints`, and `onPlotHover` is what it
   * calls with the group under its own cursor.
   *
   * Taken as a function, and the hover state kept here rather than on the page, because a hover
   * must not re-render whatever builds the points. React Compiler memoizes in scopes and puts
   * neighbouring values in one together, so hover state beside the point maths gates it: every
   * chip the cursor crosses then rebuilds both cohorts' pointData. ScatterPlot cancels its 120ms
   * hover growth when pointData changes identity mid-animation, which is one stray re-render away
   * from a highlight that never grows - see ExplorerPlot, where that bug was found.
   */
  children: (hover: { legendHover: string | null; onPlotHover: (group: string | null) => void }) => ReactNode;
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
const PlotCard = <K extends ColorField>({
  title,
  shown,
  total,
  options,
  colorBy,
  onColorByChange,
  groups,
  hidden,
  onToggle,
  plotRef,
  children,
}: PlotCardProps<K>) => {
  // The highlight runs both ways. plotHover is the group under the cursor in the plot, which rings
  // the matching chip; legendHover is the chip under the cursor, handed back to the plot so its
  // group swells. Only one can be set at a time - reaching a chip means leaving the plot - but they
  // are kept apart so neither can feed the other back into itself.
  //
  // Only a chip swells a group. A hovered point grows alone and names its group by ringing the
  // chip, as on the dimensionality reduction explorer, where a point sits in a group in both a color
  // and a shape legend and swelling either one on the plot would favour it over the other.
  const [plotHover, setPlotHover] = useState<string | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);

  return (
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
              locale would separate the thousands differently and fail hydration.
              Nothing switched off is the common case, and "(1,161 / 1,161)" would
              only make the reader check two numbers to learn that. */}
            ({shown.toLocaleString("en-US")}
            {shown !== total && ` / ${total.toLocaleString("en-US")}`})
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
          highlighted={plotHover ?? legendHover}
          onHover={setLegendHover}
        />
        {/*
        Bottom-aligned, not centred. Both plots render at the smaller of the two containers, so
        the card with the shorter legend has room to spare below its plot. Pinning the plot to
        the bottom puts both x-axes on the same line, which is what makes the two cohorts
        readable side by side.
      */}
        <Box ref={plotRef} flex={1} minHeight={0} display="flex" flexDirection="column" justifyContent="flex-end">
          {children({ legendHover, onPlotHover: setPlotHover })}
        </Box>
      </Stack>
    </Paper>
  );
};

export default PlotCard;
