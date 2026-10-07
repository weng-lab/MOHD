/**
 * The API's age_bin values, youngest first, spelled exactly as it returns them. The bins under 30 are
 * uneven because the consortium sets them, so they're listed rather than derived from edges. A value
 * missing here has no color and sorts after "80+" in every legend: when the API's bins change, so must this,
 * and so must AGE_BINS in scripts/buildMohdCatalog.mjs, which plain node can't import from here.
 */
export const AGE_BIN_LABELS = ["8-12", "13-17", "18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"];

const AGE_UNKNOWN_LABEL = "unknown";

// Classic rainbow/jet-style spectral ramp (young -> old): blue -> teal -> green -> yellow -> orange -> red.
const AGE_GRADIENT_STOPS: [number, number, number][] = [
  [30, 58, 138], // #1e3a8a dark blue
  [47, 111, 176], // #2f6fb0 blue
  [63, 160, 181], // #3fa0b5 teal
  [76, 175, 109], // #4caf6d green
  [168, 201, 87], // #a8c957 yellow-green
  [242, 210, 74], // #f2d24a yellow
  [239, 145, 66], // #ef9142 orange
  [217, 80, 42], // #d9502a red
];

const toHex = (n: number) => n.toString(16).padStart(2, "0");

function interpolateGradient(stops: [number, number, number][], t: number): [number, number, number] {
  const scaled = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(scaled), stops.length - 2);
  const localT = scaled - i;
  const [r0, g0, b0] = stops[i];
  const [r1, g1, b1] = stops[i + 1];
  return [
    Math.round(r0 + (r1 - r0) * localT),
    Math.round(g0 + (g1 - g0) * localT),
    Math.round(b0 + (b1 - b0) * localT),
  ];
}

const AGE_BIN_RAMP = AGE_BIN_LABELS.map((_, i) => {
  const t = AGE_BIN_LABELS.length === 1 ? 0 : i / (AGE_BIN_LABELS.length - 1);
  const [r, g, b] = interpolateGradient(AGE_GRADIENT_STOPS, t);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
});

export const age_bin_color_map: Record<string, string> = {
  ...Object.fromEntries(AGE_BIN_LABELS.map((label, i) => [label, AGE_BIN_RAMP[i]])),
  [AGE_UNKNOWN_LABEL]: "#CCCCCC",
};
