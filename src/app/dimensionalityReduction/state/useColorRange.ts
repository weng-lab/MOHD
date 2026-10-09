import { useState } from "react";
import { defaultRange } from "@/common/colorRamp";
import { sameRange, type ColorRange, type ColorRangeControl } from "@weng-lab/visualization";
import { fromLogValue, toLogValue } from "@/common/quantification";
import { isMetric } from "../model/metrics";
import type { ExplorerState } from "./params";

const identity = (value: number) => value;

/**
 * Where the ramp coloring the plot stops, and the control that moves it. Null and undefined while
 * nothing is on a ramp. Fitted to every sample, shown or not, so filtering never repaints a point.
 *
 * `values` is every value on the ramp, sorted, in the ramp's units: a metric's own, or log10(value + 1)
 * for a feature. A link holds the range in the data's units instead.
 */
export const useColorRange = (
  state: ExplorerState,
  setState: (next: ExplorerState) => void,
  values: Float64Array
): { range: ColorRange | null; control: ColorRangeControl | undefined } => {
  // The range while the editor is open, written to the URL only on close: frequent URL writes hit
  // Safari's history limit and React's update depth. Keyed to the state it was set over, so it stops
  // applying as soon as the URL changes, without a flash of the old range.
  const [draft, setDraft] = useState<{ range: ColorRange; over: ExplorerState } | null>(null);
  const draftRange = draft?.over === state ? draft.range : null;
  if (values.length === 0) return { range: null, control: undefined };

  const [toRamp, fromRamp] = isMetric(state.color) ? [identity, identity] : [toLogValue, fromLogValue];
  const initialRange = defaultRange(values);
  const savedRange: ColorRange | null = state.range && [toRamp(state.range[0]), toRamp(state.range[1])];

  return {
    range: draftRange ?? savedRange ?? initialRange,
    // The editor reaches across `values` and offers its percentile presets, by default.
    control: {
      defaultRange: initialRange,
      onChange: (range) => setDraft({ range, over: state }),
      onClose: () => {
        if (!draftRange) return;
        // The default is left out of the link, as every other default is.
        setState({
          ...state,
          range: sameRange(draftRange, initialRange) ? null : [fromRamp(draftRange[0]), fromRamp(draftRange[1])],
        });
      },
    },
  };
};
