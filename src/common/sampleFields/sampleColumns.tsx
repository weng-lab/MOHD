import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { TableColDef } from "@weng-lab/ui-components";
import {
  QC_GROUP,
  columnOf,
  groupOf,
  isNeutralGroup,
  labelOf,
  type Field,
  type FieldDefinition,
  type SampleGroups,
} from "./fields";
import { groupsOf } from "./groups";

export const DATASET_COLUMN = { field: "sample_id", headerName: "Dataset" } as const;

/**
 * What a cell shows: a QC sample's status reads "QC / Reference", muted as the plot grays it, and
 * its other fields - which no QC sample has - are blank, as is a participant's missing value.
 */
const cellOf = (field: Field, value: string, formattedValue: ReactNode): ReactNode => {
  if (value === QC_GROUP && field === "status") {
    return (
      <Box component="span" color="text.secondary">
        {formattedValue}
      </Box>
    );
  }
  return isNeutralGroup(value) ? null : formattedValue;
};

/**
 * The Dataset column, then one per field. A field's column holds the chips' groups rather than the
 * raw value, so filtering it and clicking a chip are the same thing - see cellOf for how they read.
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
    renderCell: ({ value, formattedValue }) => (value === undefined ? null : cellOf(key, value, formattedValue)),
  })),
];
