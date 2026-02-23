import { GRID_CHECKBOX_SELECTION_COL_DEF, GridColDef, gridFilteredSortedRowEntriesSelector, GridRowSelectionModel, GridSortDirection, GridSortModel, Table, useGridApiRef } from "@weng-lab/ui-components";
import { ATACMetadata, SharedATACDimenionalityProps } from "./page";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import AutoSortSwitch from "@/common/components/AutoSortSwitch";

const ATACDimensionalityTable = ({
    rows,
    ATACData,
    selected,
    setSelected,
    setSortedFilteredData,
    sortedFilteredData,
}: SharedATACDimenionalityProps) => {
    const [autoSort, setAutoSort] = useState<boolean>(false);

    const { loading, error } = ATACData;
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    //This is used to prevent sorting from happening when clicking on the header checkbox
    const StopPropagationWrapper = (params) => (
        <div id={"StopPropagationWrapper"} onClick={(e) => e.stopPropagation()}>
            {GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader
                ? GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader(params)
                : null}
        </div>
    );

    const columns: GridColDef<ATACMetadata>[] = [
        {
            ...(GRID_CHECKBOX_SELECTION_COL_DEF as GridColDef<ATACMetadata>), //Override checkbox column https://mui.com/x/react-data-grid/row-selection/#custom-checkbox-column
            sortable: true,
            hideable: false,
            renderHeader: StopPropagationWrapper,
        },
        {
            field: "sample_id",
            headerName: "Sample ID",
        },
        {
            field: "status",
            headerName: "Status",
        },
        {
            field: "site",
            headerName: "Site",
        },
        {
            field: "sex",
            headerName: "Sex",
        },
        {
            field: "protocol",
            headerName: "Protocol",
        }
    ];

    const handleRowSelectionModelChange = (newRowSelectionModel: GridRowSelectionModel) => {
        if (newRowSelectionModel.type === "include") {
            const newIds = Array.from(newRowSelectionModel.ids);
            const selectedRows = newIds.map((id) => rows.find((row) => row.sample_id === id));
            setSelected(selectedRows);
        } else {
            // if type is exclude, it's always with 0 ids (aka select all)
            setSelected(rows);
        }
    };

    const apiRef = useGridApiRef();

    const arraysAreEqual = (arr1: ATACMetadata, arr2: ATACMetadata): boolean => {
        if (arr1.length !== arr2.length) {
            return false;
        }

        const isEqual = JSON.stringify(arr1[0]) === JSON.stringify(arr2[0]);
        if (!isEqual) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].sample_id !== arr2[i].sample_id) {
                return false;
            }
        }
        return true;
    };

    const handleSync = () => {
        const syncrows = gridFilteredSortedRowEntriesSelector(apiRef).map((x) => x.model) as ATACMetadata;
        if (!arraysAreEqual(sortedFilteredData, syncrows)) {
            setSortedFilteredData(syncrows);
        }
    };

    const AutoSortToolbar = useMemo(() => {
        return <AutoSortSwitch autoSort={autoSort} setAutoSort={setAutoSort} />;
    }, [autoSort]);

    const initialSort: GridSortModel = useMemo(() => [{ field: "tpm", sort: "desc" as GridSortDirection }], []);

    // handle auto sorting
    useEffect(() => {
        const api = apiRef?.current;
        if (!api) return;

        const hasSelection = selected?.length > 0;

        // all other views
        if (!autoSort) {
            //reset sort if none selected
            api.setSortModel(initialSort);
            return;
        }

        //sort by checkboxes if some selected, otherwise sort by tpm
        api.setSortModel(hasSelection ? [{ field: "__check__", sort: "desc" }] : initialSort);
    }, [apiRef, autoSort, initialSort, selected]);

    const rowSelectionModel: GridRowSelectionModel = useMemo(() => {
        return { type: "include", ids: new Set(selected.map((x) => x.sample_id)) };
    }, [selected]);

    return (
        <Table
            apiRef={apiRef}
            label={`ATAC-seq Dimensionality Reduction`}
            rows={rows}
            columns={columns}
            loading={loading}
            error={!!error}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
                sorting: {
                    sortModel: initialSort,
                },
            }}
            // -- Selection Props --
            checkboxSelection
            getRowId={(row: typeof rows[number]) => row.sample_id} //needed to match up data with the ids returned by onRowSelectionModelChange
            onRowSelectionModelChange={handleRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            keepNonExistentRowsSelected // Needed to prevent clearing selections on changing filters
            // -- End Selection Props --
            onStateChange={handleSync} // Not really supposed to be using this, is not documented by MUI. Not using its structure, just the callback trigger
            divHeight={{ height: "100%", minHeight: isXs ? "none" : "580px" }}
            toolbarSlot={AutoSortToolbar}
        />
    );
}

export default ATACDimensionalityTable;