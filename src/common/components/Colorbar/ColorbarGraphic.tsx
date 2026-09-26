"use client";

import { Tooltip } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import { useEffect, useId, useRef, type MouseEvent } from "react";
import {
  formatShare,
  histogram,
  rangeAt,
  rangeAxis,
  summarize,
  valuesIn,
  type ColorRange,
  type RampRange,
  type RampStop,
} from "./colorbarAxis";

export type ColorbarOrientation = "horizontal" | "vertical";

const BAR = 10;
const GAP = 2;
/** The histogram's depth: held to a chip row's 24px lying down, roomier standing up beside a heatmap. */
const HISTOGRAM = { horizontal: 12, vertical: 16 } as const;
/** Pixels of bar per histogram column. */
const COLUMN = 5;
/** Neutral, so the columns read as counts rather than as more of the ramp - its yellow would vanish on white. */
const COLUMN_COLOR = blueGrey[700];

/**
 * The break cut through a capped column, as a broken axis draws it: a band slanting up to the right,
 * which reads as a cut at any size - a level gap a couple of pixels high reads as a glitch. Given in
 * the column's own terms, `from` to `to` across its width and centred `at` along its height, with
 * `rise` the band's climb over that width and `gap` its height; `place` puts a point in those terms
 * on screen. Handed back as polygon points.
 */
export const breakPoints = (
  place: (across: number, up: number) => [number, number],
  { from, to, at, rise, gap }: { from: number; to: number; at: number; rise: number; gap: number }
) =>
  [
    place(from, at - rise / 2 - gap / 2),
    place(to, at + rise / 2 - gap / 2),
    place(to, at + rise / 2 + gap / 2),
    place(from, at - rise / 2 + gap / 2),
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

/** How much room the graphic takes across the bar: histogram, gap and bar. */
export const colorbarDepth = (orientation: ColorbarOrientation) => HISTOGRAM[orientation] + GAP + BAR;

export type ColorbarGraphicProps = {
  orientation: ColorbarOrientation;
  /** The bar's length in pixels. */
  length: number;
  stops: readonly RampStop[];
  /** Where the colors stop. The bar spans it, and its end columns count the values beyond. */
  range: ColorRange;
  /** Every value on the plot, sorted ascending and unclamped: what the columns count. */
  values: ArrayLike<number>;
  format: (value: number) => string;
  /**
   * How the sweep writes the lowest and highest value inside it - real values, which can want more
   * precision than the scale's rounded ends: two lipids at 104M and 116M both round to "110M".
   */
  formatValue?: (value: number) => string;
  /** What one value is, for the sweep's count: "sample", "cell". */
  noun: string;
  /** The stretch of the bar under the cursor, drawn on it as a window. */
  sweep: RampRange | null;
  /** Fired as the cursor moves along the bar and when it leaves, so the plot can highlight the window's values. */
  onSweep: (sweep: RampRange | null) => void;
  /** A value to mark on the bar - the hovered point's. */
  marker?: number | null;
  /**
   * Where the sweep's tooltip portals to, where the page's body won't do: inside a heatmap's
   * expanded minimap, which sits above everything portaled there - see HeatmapLegendFrame.
   */
  overlayContainer?: HTMLElement;
};

/**
 * A colorbar with a histogram of the plot's values along it, drawn as SVG - a `<g>` in the caller's
 * own `<svg>` - so a heatmap can hand it to the library as its legend and downloads keep it.
 *
 * The histogram is scaled to its tallest column short of the two ends. The ends count every value
 * beyond the colors' range as well as their own, and a feature below its detection limit piles half
 * the samples into the lowest one; scaled to that, every other column would flatten to a pixel. An
 * end column taller than the rest is drawn to the top with a gap cut through its middle - the break
 * of a broken bar chart.
 */
const ColorbarGraphic = ({
  orientation,
  length,
  stops,
  range,
  values,
  format,
  formatValue = format,
  noun,
  sweep,
  onSweep,
  marker = null,
  overlayContainer,
}: ColorbarGraphicProps) => {
  const theme = useTheme();
  const gradientId = `colorbar-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const horizontal = orientation === "horizontal";
  const depth = HISTOGRAM[orientation];
  const axis = rangeAxis(range);

  const bins = Math.max(8, Math.round(length / COLUMN));
  const counts = histogram(values, axis, bins);
  const tallest = Math.max(1, ...counts.slice(1, -1));

  // Everything is placed along the bar (t, 0 at its low end) and across it. Lying down, the
  // histogram sits above the bar; standing up, it sits to the bar's right, and low is at the bottom.
  const barAcross: [number, number] = horizontal ? [depth + GAP, depth + GAP + BAR] : [0, BAR];
  const box = (t0: number, t1: number, [a0, a1]: [number, number]) =>
    horizontal
      ? { x: t0 * length, y: a0, width: (t1 - t0) * length, height: a1 - a0 }
      : { x: a0, y: length - t1 * length, width: a1 - a0, height: (t1 - t0) * length };
  // A column's extent across the bar, growing away from it.
  const columnAcross = (size: number): [number, number] =>
    horizontal ? [depth - size, depth] : [BAR + GAP, BAR + GAP + size];
  // A point given along the bar in pixels and across it, placed on screen.
  const point = (along: number, across: number): [number, number] =>
    horizontal ? [along, across] : [across, length - along];
  const around = (pad: number): [number, number] => [barAcross[0] - pad, barAcross[1] + pad];

  const inside = sweep && summarize(values, valuesIn(axis, sweep));
  const sweepText = !inside
    ? ""
    : inside.count === 0
      ? `No ${noun}s here`
      : `${inside.count.toLocaleString("en-US")} ${noun}${inside.count === 1 ? "" : "s"}` +
        ` (${formatShare(inside.count, values.length)})` +
        // The true lowest and highest inside - at either end of the bar, past where the colors stop.
        ` · ${formatValue(inside.lowest!)} – ${formatValue(inside.highest!)}`;

  // Whether the cursor is sweeping this bar. A bar can go while it is - Escape closes a heatmap's
  // expanded minimap, legend and all, under a still cursor - and then no mouseleave comes to end
  // the sweep, which would leave the plot dimmed with nothing under the cursor to undo it.
  const sweeping = useRef(false);
  const onSweepRef = useRef(onSweep);
  useEffect(() => {
    onSweepRef.current = onSweep;
  });
  useEffect(
    () => () => {
      if (sweeping.current) onSweepRef.current(null);
    },
    []
  );

  const handleMove = (event: MouseEvent<SVGRectElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    sweeping.current = true;
    onSweep(rangeAt(horizontal ? (event.clientX - left) / width : 1 - (event.clientY - top) / height));
  };
  const handleLeave = () => {
    sweeping.current = false;
    onSweep(null);
  };

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1={horizontal ? "0" : "1"} x2={horizontal ? "1" : "0"} y2="0">
          {stops.map(({ at, color }) => (
            <stop key={at} offset={`${at * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
      </defs>

      {counts.map((count, k) => {
        if (count === 0) return null;
        const share = count / tallest;
        const size = Math.max(1, Math.min(share, 1) * depth);
        // A pixel between columns, taken off each column's high side.
        const t0 = k / bins;
        const t1 = (k + 1) / bins - 1 / length;
        return (
          <g key={k}>
            <rect {...box(t0, t1, columnAcross(size))} fill={COLUMN_COLOR} />
            {share > 1 && (
              <polygon
                // Past the column's sides by half a pixel, so no sliver of it is left standing either side.
                points={breakPoints(
                  // Lying down, a column grows up the screen, where y falls; standing up, it grows rightward.
                  (across, up) => point(across, horizontal ? depth - up : BAR + GAP + up),
                  { from: t0 * length - 0.5, to: t1 * length + 0.5, at: depth / 2, rise: 3, gap: 2 }
                )}
                fill={theme.palette.background.paper}
              />
            )}
          </g>
        );
      })}

      <rect {...box(0, 1, barAcross)} rx={BAR / 2} fill={`url(#${gradientId})`} />

      {sweep && (
        <g fill="none">
          {/* White inside and out, so the frame holds against the dark and pale ends alike. */}
          <rect
            {...box(sweep.from, sweep.to, around(3))}
            rx={3}
            stroke={theme.palette.background.paper}
            strokeWidth={4}
          />
          <rect {...box(sweep.from, sweep.to, around(3))} rx={3} stroke={theme.palette.text.primary} strokeWidth={2} />
        </g>
      )}

      {marker !== null && (
        <rect
          {...box(axis.toT(marker) - 1.5 / length, axis.toT(marker) + 1.5 / length, around(4))}
          rx={1.5}
          fill={theme.palette.text.primary}
          stroke={theme.palette.background.paper}
          strokeWidth={1}
        />
      )}

      {/*
        The hit area runs past the bar on both sides: a sweep end to end drifts, and leaving mid-sweep
        would drop the highlight. The count follows the cursor rather than sitting over the plot.
      */}
      <Tooltip
        title={sweepText}
        open={sweep !== null}
        followCursor
        placement={horizontal ? "top" : "right"}
        disableInteractive
        slotProps={{ popper: { container: overlayContainer } }}
      >
        <rect
          {...box(0, 1, [horizontal ? -4 : -4, colorbarDepth(orientation) + 4])}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        />
      </Tooltip>
    </g>
  );
};

export default ColorbarGraphic;
