import { Box } from "@mui/material";
import type { TableColDef } from "@weng-lab/ui-components";
import { columnOf, groupOf, isNeutralGroup, labelOf, type FieldDefinition, type SampleGroups } from "./fields";
import { groupsOf } from "./groups";

export const DATASET_COLUMN = { field: "sample_id", headerName: "Dataset" } as const;

/**
 * The Dataset column, then one per field. A field's column holds the chips' groups rather than the
 * raw value, so filtering it and clicking a chip are the same thing: a QC sample reads
 * "QC / Reference" in every column, and a missing value "Unknown" - both muted, as the plot greys them.
 */
export const sampleColumns = <R extends SampleGroups>(
  fields: readonly FieldDefinition[],
  samples: readonly R[]
): TableColDef<R>[] => [
  DATASET_COLUMN,
  ...fields.map(({ key, label }): TableColDef<R> => ({
    field: columnOf(key),
    headerName: label,
    type: "singleSelect",
    // Only for a sample: grouped, the grid gives each group's own row an empty model, which would
    // otherwise read as a sample with no value - "Unknown".
    valueGetter: (_value, row) => (row.sample_id === undefined ? undefined : groupOf(key, row)),
    valueOptions: groupsOf(samples, key).map((value) => ({ value, label: labelOf(key, value) })),
    renderCell: ({ value, formattedValue }) =>
      value === undefined ? null : isNeutralGroup(value) ? (
        <Box component="span" color="text.secondary">
          {formattedValue}
        </Box>
      ) : (
        formattedValue
      ),
  })),
];
