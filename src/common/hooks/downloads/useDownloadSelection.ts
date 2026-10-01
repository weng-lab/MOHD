import { useState } from "react";
import type { GridRowSelectionModel } from "@mui/x-data-grid-premium";
import type { CatalogFile } from "@/common/components/Downloads/types";

export type CheckState = "checked" | "indeterminate" | "unchecked";

type UseDownloadSelectionArgs = {
  /** sample_id -> filenames eligible for bulk selection (open, not the bundle, passes file filter) */
  selectableByDataset: Map<string, Set<string>>;
  /** datasets currently visible after left-pane filters (only sample_id is read) */
  visibleDatasets: readonly { sample_id: string }[];
  activeDataset: string | null;
  activeFiles: CatalogFile[];
};

export type DownloadSelectionState = {
  /** sample_id -> selected filenames; the selection source of truth */
  selection: Map<string, Set<string>>;
  activeSelectionModel: GridRowSelectionModel;
  setActiveSelection: (model: GridRowSelectionModel) => void;
  numSelectedFiles: number;
  clearSelection: () => void;
  deselectFile: (datasetId: string, filename: string) => void;
  deselectDataset: (datasetId: string) => void;
  datasetCheckState: Map<string, CheckState>;
  allCheckState: CheckState;
  toggleAll: () => void;
  toggleDataset: (datasetId: string) => void;
};

/** How many of `selectable` are currently selected. */
function countSelected(selectable: ReadonlySet<string>, selected: ReadonlySet<string> | undefined): number {
  if (!selected) return 0;
  let count = 0;
  for (const f of selectable) if (selected.has(f)) count++;
  return count;
}

function checkStateFor(selectedCount: number, selectableCount: number): CheckState {
  if (selectableCount === 0 || selectedCount === 0) return "unchecked";
  return selectedCount === selectableCount ? "checked" : "indeterminate";
}

/** Per-dataset checkbox state for every dataset that can contribute files. */
function buildDatasetCheckState(
  selectableByDataset: ReadonlyMap<string, Set<string>>,
  selection: ReadonlyMap<string, Set<string>>
): Map<string, CheckState> {
  const map = new Map<string, CheckState>();
  for (const [id, selectable] of selectableByDataset) {
    map.set(id, checkStateFor(countSelected(selectable, selection.get(id)), selectable.size));
  }
  return map;
}

/** Header checkbox state, summed across the datasets currently visible. */
function buildAllCheckState(
  visibleDatasets: readonly { sample_id: string }[],
  selectableByDataset: ReadonlyMap<string, Set<string>>,
  selection: ReadonlyMap<string, Set<string>>
): CheckState {
  let totalSelectable = 0;
  let totalSelected = 0;
  for (const dataset of visibleDatasets) {
    const selectable = selectableByDataset.get(dataset.sample_id);
    if (!selectable) continue;
    totalSelectable += selectable.size;
    totalSelected += countSelected(selectable, selection.get(dataset.sample_id));
  }
  return checkStateFor(totalSelected, totalSelectable);
}

/**
 * Owns the bulk selection, tracked per dataset (sample_id -> selected
 * filenames) so identical filenames across datasets can't collide. Exposes the
 * active dataset's slice as a grid selection model plus the header/row
 * checkbox state and toggles.
 *
 * Nothing here is hand-memoized: React Compiler caches both the derived values
 * and the handler identities the grid receives as props.
 */
export function useDownloadSelection({
  selectableByDataset,
  visibleDatasets,
  activeDataset,
  activeFiles,
}: UseDownloadSelectionArgs): DownloadSelectionState {
  const [selection, setSelection] = useState<Map<string, Set<string>>>(() => new Map());

  const setActiveSelection = (model: GridRowSelectionModel) => {
    if (!activeDataset) return;
    const ids =
      model.type === "exclude"
        ? new Set(activeFiles.flatMap((f) => (model.ids.has(f.filename) ? [] : [f.filename])))
        : new Set([...model.ids].map(String));

    setSelection((prev) => {
      const nextMap = new Map(prev);
      if (ids.size === 0) nextMap.delete(activeDataset);
      else nextMap.set(activeDataset, ids);
      return nextMap;
    });
  };

  const activeSelectionModel: GridRowSelectionModel = {
    type: "include",
    ids: new Set<string>(activeDataset ? (selection.get(activeDataset) ?? []) : []),
  };

  let numSelectedFiles = 0;
  for (const set of selection.values()) numSelectedFiles += set.size;

  const clearSelection = () => setSelection(new Map());

  // Removals driven from outside the grid (the download modal). Dropping the
  // last file of a dataset drops the dataset entry, matching setActiveSelection.
  const deselectFile = (datasetId: string, filename: string) => {
    setSelection((prev) => {
      const selected = prev.get(datasetId);
      if (!selected?.has(filename)) return prev;
      const nextMap = new Map(prev);
      const nextSet = new Set(selected);
      nextSet.delete(filename);
      if (nextSet.size === 0) nextMap.delete(datasetId);
      else nextMap.set(datasetId, nextSet);
      return nextMap;
    });
  };

  const deselectDataset = (datasetId: string) => {
    setSelection((prev) => {
      if (!prev.has(datasetId)) return prev;
      const nextMap = new Map(prev);
      nextMap.delete(datasetId);
      return nextMap;
    });
  };

  const datasetCheckState = buildDatasetCheckState(selectableByDataset, selection);
  const allCheckState = buildAllCheckState(visibleDatasets, selectableByDataset, selection);

  const toggleAll = () => {
    const deselect = allCheckState === "checked";
    setSelection((prev) => {
      const nextMap = new Map(prev);
      for (const dataset of visibleDatasets) {
        const selectable = selectableByDataset.get(dataset.sample_id);
        if (!selectable || selectable.size === 0) continue;
        if (deselect) nextMap.delete(dataset.sample_id);
        else nextMap.set(dataset.sample_id, new Set(selectable));
      }
      return nextMap;
    });
  };

  const toggleDataset = (datasetId: string) => {
    const selectable = selectableByDataset.get(datasetId);
    if (!selectable?.size) return;
    const allSelected = datasetCheckState.get(datasetId) === "checked";
    setSelection((prev) => {
      const nextMap = new Map(prev);
      if (allSelected) nextMap.delete(datasetId);
      else nextMap.set(datasetId, new Set(selectable));
      return nextMap;
    });
  };

  return {
    selection,
    activeSelectionModel,
    setActiveSelection,
    numSelectedFiles,
    clearSelection,
    deselectFile,
    deselectDataset,
    datasetCheckState,
    allCheckState,
    toggleAll,
    toggleDataset,
  };
}
