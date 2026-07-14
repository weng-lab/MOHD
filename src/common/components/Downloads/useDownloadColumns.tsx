import { Checkbox, IconButton, Tooltip } from "@mui/material";
import { Download, FolderZip } from "@mui/icons-material";
import Image from "next/image";
import { GRID_CHECKBOX_SELECTION_COL_DEF } from "@mui/x-data-grid-premium";
import { TableColDef } from "@weng-lab/ui-components";
import type { CatalogFile } from "@/common/components/Downloads/types";
import type { CheckState } from "@/common/hooks/downloads/useDownloadSelection";

/** Per-file download affordance: direct link when open, AnVIL request otherwise. */
const FileDownloadCell = ({ file }: { file: CatalogFile }) => {
  const { open_access, url } = file;

  if (!open_access) {
    return (
      <IconButton
        component="a"
        href="https://anvilproject.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="/logo-mark-Anvil.png" alt="AnVIL" width={28} height={28} />
      </IconButton>
    );
  }
  return (
    <IconButton component="a" href={url} download color="primary" disabled={!url}>
      <Download />
    </IconButton>
  );
};

type UseDownloadColumnsArgs = {
  /** Base (filterable) dataset columns from the state hook. */
  datasetColumns: TableColDef[];
  /** Base (filterable) file columns from the state hook. */
  fileColumns: TableColDef[];
  allCheckState: CheckState;
  visibleDatasets: readonly { sample_id: string }[];
  selectableByDataset: Map<string, Set<string>>;
  datasetCheckState: Map<string, CheckState>;
  toggleAll: () => void;
  toggleDataset: (datasetId: string) => void;
};

/**
 * Builds the two grids' columns, prepending the interactive columns whose cells
 * need render functions (the bulk-select checkbox column for datasets, and the
 * row-select + per-file download columns for files).
 */
export function useDownloadColumns({
  datasetColumns,
  fileColumns,
  allCheckState,
  visibleDatasets,
  selectableByDataset,
  datasetCheckState,
  toggleAll,
  toggleDataset,
}: UseDownloadColumnsArgs) {
  const datasetColumnsWithSelect: TableColDef[] = [
    {
      field: "_select",
      headerName: "",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      display: "flex",
      align: "left",
      cellClassName: "MuiDataGrid-cellCheckbox",
      headerClassName: "MuiDataGrid-columnHeaderCheckbox",
      renderHeader: () => (
        <>
          <Checkbox
            checked={allCheckState === "checked"}
            indeterminate={allCheckState === "indeterminate"}
            disabled={
              allCheckState === "unchecked" &&
              visibleDatasets.every((d) => !selectableByDataset.get(d.sample_id)?.size)
            }
            onClick={toggleAll}
          />
          <Tooltip title={"Bulk Download"}>
            <FolderZip color="primary" />
          </Tooltip>
        </>
      ),
      renderCell: (params: { row: { sample_id: string } }) => {
        const checkState = datasetCheckState.get(params.row.sample_id);
        const disabled = !selectableByDataset.get(params.row.sample_id)?.size;
        return (
          <Checkbox
            checked={checkState === "checked"}
            indeterminate={checkState === "indeterminate"}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              toggleDataset(params.row.sample_id);
            }}
          />
        );
      },
    },
    ...datasetColumns,
  ];

  const fileColumnsWithDownload: TableColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      align: "left",
      headerAlign: "left",
      display: "flex",
      renderHeader: (params) => {
        const DefaultCheckbox = GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader;
        if (!DefaultCheckbox) return null;
        return (
          <>
            <DefaultCheckbox {...params} />
            <Tooltip title={"Bulk Download"}>
              <FolderZip color="primary" />
            </Tooltip>
          </>
        );
      },
    },
    {
      field: "open_access",
      headerName: "Download",
      display: "flex" as const,
      sortable: false,
      filterable: false,
      renderCell: (params: { row: CatalogFile }) => <FileDownloadCell file={params.row} />,
    },
    ...fileColumns,
  ];

  return { datasetColumnsWithSelect, fileColumnsWithDownload };
}
