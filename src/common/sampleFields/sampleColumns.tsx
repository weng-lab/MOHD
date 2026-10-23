import type { ReactNode } from "react";
import { Box, Tooltip } from "@mui/material";
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  type GridRenderCellParams,
  type GridSortDirection,
  type GridSortModel,
} from "@mui/x-data-grid-premium";
import type { TableColDef } from "@weng-lab/ui-components";
import {
  QC_GROUP,
  columnOf,
  compareGroups,
  groupOf,
  isNeutralGroup,
  labelOf,
  type Field,
  type FieldDefinition,
  type SampleGroups,
} from "./fields";
import { groupsOf } from "./groups";

export const DATASET_COLUMN = { field: "sample_id", headerName: "Dataset" } as const;

const UNPLOTTED_NOTE = "This sample has no data to plot";

/** The grid's own selection column, whose disabled checkboxes - an unplotted sample's - say why on hover. */
const CHECKBOX_COLUMN: TableColDef = {
  ...GRID_CHECKBOX_SELECTION_COL_DEF,
  renderCell: (params) => {
    const checkbox = GRID_CHECKBOX_SELECTION_COL_DEF.renderCell?.(params);
    return (params.row as SampleGroups).unplotted ? (
      <Tooltip title={UNPLOTTED_NOTE}>
        {/* A disabled checkbox fires no hover events, so the tooltip listens on this instead. */}
        <Box component="span" sx={{ display: "inline-flex" }}>
          {checkbox}
        </Box>
      </Tooltip>
    ) : (
      checkbox
    );
  },
};

/** Whether a sample can be checked in the table: one no plot draws couldn't show it was. */
export const isSampleSelectable = ({ row }: { row: SampleGroups }) => !row.unplotted;

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
 * Every table of samples starts sorted by site, QC samples last - see sampleFieldColumn. The rows
 * arrive in sample ID order and the grid's sort is stable, so each site lists its samples by ID.
 */
export const INITIAL_SAMPLE_SORT: GridSortModel = [{ field: columnOf("site"), sort: "asc" }];

/**
 * What a field's column does in every table of samples, an ome page's or a downloads page's, so
 * both list QC samples alike: muted "QC / Reference" under Status, blank elsewhere, and last
 * however the column is sorted, after any participant with no value. Given only a sortComparator,
 * the grid reverses it for a descending sort, which would bring them to the top. That comparator
 * stays, ascending, for a grouped table's group rows, the one place the grid still uses it.
 */
export const sampleFieldColumn = (field: Field) => ({
  sortComparator: compareGroups(field),
  getSortComparator: (direction: GridSortDirection) => compareGroups(field, direction ?? "asc"),
  renderCell: ({ value, formattedValue }: GridRenderCellParams) =>
    value === undefined || value === null ? null : cellOf(field, value, formattedValue),
});

/**
 * The selection column, the Dataset column, then one per field. A field's column holds the chips'
 * groups rather than the raw value, so filtering it and clicking a chip are the same thing - see
 * cellOf for how they read.
 */
export const sampleColumns = <R extends SampleGroups>(
  fields: readonly FieldDefinition[],
  samples: readonly R[]
): TableColDef<R>[] => [
  CHECKBOX_COLUMN,
  DATASET_COLUMN,
  ...fields.map(({ key, label }): TableColDef<R> => ({
    field: columnOf(key),
    headerName: label,
    type: "singleSelect",
    // Only for a sample: grouped, the grid gives each group's own row an empty model, which would
    // otherwise read as a sample with no value - "Unknown".
    valueGetter: (_value, row) => (row.sample_id === undefined ? undefined : groupOf(key, row)),
    valueOptions: groupsOf(samples, key).map((value) => ({ value, label: labelOf(key, value) })),
    ...sampleFieldColumn(key),
  })),
];
