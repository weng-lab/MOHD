/** z = (x - μ) / σ, computed across the given row's own values so each row is scaled independently. */
export const zScoreByRow = (rowValues: (number | null)[]) => {
  const values = rowValues.filter((v): v is number => v !== null);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  return (value: number) => (std === 0 ? 0 : (value - mean) / std);
};
