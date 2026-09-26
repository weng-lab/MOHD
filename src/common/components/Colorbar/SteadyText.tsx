"use client";

import { Box } from "@mui/material";
import { useState } from "react";

export type SteadyTextProps = {
  text: string;
  /**
   * While true, the text keeps the width of the widest it has been since: it can widen, but not
   * shrink back. While false it takes its own width.
   */
  hold: boolean;
  /** Which side the text keeps to within a held width: the side facing what it labels. */
  align?: "start" | "end";
};

/**
 * A label that doesn't shrink back and forth while a range is dragged, so neither it nor what sits
 * beside it wobbles, yet takes its own width the rest of the time.
 *
 * Reserving the widest label the range could ever produce would hold everything still from the
 * start, but at the cost of a gap wherever the label is short - a lone "0" beside a bar that could
 * read "≤ 0.011 TPM" - and the gap is there whenever the editor is not. Held only while it is open,
 * the label widens as a drag reaches wider values and stays there, so a drag moves the bar at most
 * a few times, one way.
 *
 * Each shape it has taken - its digits written as 0 - lies hidden in the grid cell it sits in, which
 * takes the widest of them. In tabular figures every digit is as wide as a 0, so a shape is as wide
 * as any text of that shape.
 */
const SteadyText = ({ text, hold, align = "start" }: SteadyTextProps) => {
  const shape = text.replace(/\d/g, "0");
  const [shapes, setShapes] = useState<string[]>([]);
  // Recorded as it renders rather than in an effect, which would commit again on every step of a drag.
  if (!hold && shapes.length > 0) setShapes([]);
  if (hold && !shapes.includes(shape)) setShapes([...shapes, shape]);

  return (
    <Box component="span" sx={{ display: "inline-grid", justifyItems: align, fontVariantNumeric: "tabular-nums" }}>
      {hold &&
        shapes.map((held) => (
          <Box key={held} component="span" sx={{ gridArea: "1 / 1", visibility: "hidden", whiteSpace: "pre" }}>
            {held}
          </Box>
        ))}
      <Box component="span" sx={{ gridArea: "1 / 1", whiteSpace: "pre" }}>
        {text}
      </Box>
    </Box>
  );
};

export default SteadyText;
