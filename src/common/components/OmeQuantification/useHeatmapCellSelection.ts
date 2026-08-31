import { useMemo } from "react";
import { ColumnDatum, HeatmapCellId } from "@weng-lab/visualization";

export type CellSelectionSample = {
    sample_id: string;
};

export const useHeatmapCellSelection = <TSample extends CellSelectionSample>(
    heatmapData: ColumnDatum<TSample, Record<string, unknown>>[],
    samples: TSample[],
    selected: TSample[],
    setSelected: React.Dispatch<React.SetStateAction<TSample[]>>
) => {
    const selectedCells: HeatmapCellId[] = useMemo(() => {
        const selectedIds = new Set(selected.map((sample) => sample.sample_id));
        return heatmapData.flatMap((column, columnIndex) =>
            selectedIds.has(column.columnName)
                ? column.rows.map((_, rowIndex) => ({ row: rowIndex, column: columnIndex }))
                : []
        );
    }, [heatmapData, selected]);

    const handleCellClick = (sampleId: string) => {
        const sample = samples.find((s) => s.sample_id === sampleId);
        if (!sample) return;

        setSelected((prev) =>
            prev.some((s) => s.sample_id === sampleId)
                ? prev.filter((s) => s.sample_id !== sampleId)
                : [...prev, sample]
        );
    };

    return { selectedCells, handleCellClick };
};
