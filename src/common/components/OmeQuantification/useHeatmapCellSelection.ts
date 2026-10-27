import type { ZoomableHeatmapCell } from "@weng-lab/visualization";

export type CellSelectionSample = {
  sample_id: string;
};

/** The heatmap's columns whose samples are selected, and a cell click toggling its column's sample. */
export const useHeatmapCellSelection = <TSample extends CellSelectionSample>(
  samples: TSample[],
  selected: TSample[],
  setSelected: React.Dispatch<React.SetStateAction<TSample[]>>
) => {
  const selectedIds = new Set(selected.map((sample) => sample.sample_id));
  const selectedColumns = samples.flatMap((sample, column) => (selectedIds.has(sample.sample_id) ? [column] : []));

  const handleCellClick = ({ column }: ZoomableHeatmapCell) => {
    const sample = samples[column];
    setSelected((prev) =>
      prev.some((s) => s.sample_id === sample.sample_id)
        ? prev.filter((s) => s.sample_id !== sample.sample_id)
        : [...prev, sample]
    );
  };

  return { selectedColumns, handleCellClick };
};
