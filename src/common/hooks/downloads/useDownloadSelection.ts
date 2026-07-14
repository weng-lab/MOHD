import { useCallback, useMemo, useState } from "react";
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
  datasetCheckState: Map<string, CheckState>;
  allCheckState: CheckState;
  toggleAll: () => void;
  toggleDataset: (datasetId: string) => void;
};

/**
 * Owns the bulk selection, tracked per dataset (sample_id -> selected
 * filenames) so identical filenames across datasets can't collide. Exposes the
 * active dataset's slice as a grid selection model plus the header/row
 * checkbox state and toggles.
 */
export function useDownloadSelection({
  selectableByDataset,
  visibleDatasets,
  activeDataset,
  activeFiles,
}: UseDownloadSelectionArgs): DownloadSelectionState {
  const [selection, setSelection] = useState<Map<string, Set<string>>>(() => new Map());

  const setActiveSelection = useCallback(
    (model: GridRowSelectionModel) => {
      if (!activeDataset) return;
      const ids =
        model.type === "exclude"
          ? new Set(activeFiles.map((f) => f.filename).filter((fn) => !model.ids.has(fn)))
          : new Set([...model.ids].map(String));

      setSelection((prev) => {
        const nextMap = new Map(prev);
        if (ids.size === 0) nextMap.delete(activeDataset);
        else nextMap.set(activeDataset, ids);
        return nextMap;
      });
    },
    [activeDataset, activeFiles]
  );

  const activeSelectionModel: GridRowSelectionModel = useMemo(
    () => ({
      type: "include",
      ids: new Set<string>(activeDataset ? selection.get(activeDataset) ?? [] : []),
    }),
    [activeDataset, selection]
  );

  const numSelectedFiles = useMemo(() => {
    let n = 0;
    for (const set of selection.values()) n += set.size;
    return n;
  }, [selection]);

  const clearSelection = useCallback(() => setSelection(new Map()), []);

  const datasetCheckState = useMemo(() => {
    const map = new Map<string, CheckState>();
    for (const [id, selectable] of selectableByDataset) {
      if (selectable.size === 0) {
        map.set(id, "unchecked");
        continue;
      }
      const selected = selection.get(id);
      let count = 0;
      if (selected) {
        for (const f of selectable) if (selected.has(f)) count++;
      }
      if (count === selectable.size) map.set(id, "checked");
      else if (count > 0) map.set(id, "indeterminate");
      else map.set(id, "unchecked");
    }
    return map;
  }, [selectableByDataset, selection]);

  const allCheckState = useMemo((): CheckState => {
    let totalSelectable = 0;
    let totalSelected = 0;
    for (const dataset of visibleDatasets) {
      const selectable = selectableByDataset.get(dataset.sample_id);
      if (!selectable) continue;
      totalSelectable += selectable.size;
      const selected = selection.get(dataset.sample_id);
      if (selected) {
        for (const f of selectable) if (selected.has(f)) totalSelected++;
      }
    }
    if (totalSelectable === 0) return "unchecked";
    if (totalSelected === totalSelectable) return "checked";
    if (totalSelected > 0) return "indeterminate";
    return "unchecked";
  }, [visibleDatasets, selectableByDataset, selection]);

  const toggleAll = useCallback(() => {
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
  }, [visibleDatasets, selectableByDataset, allCheckState]);

  const toggleDataset = useCallback(
    (datasetId: string) => {
      const selectable = selectableByDataset.get(datasetId);
      if (!selectable?.size) return;
      const allSelected = datasetCheckState.get(datasetId) === "checked";
      setSelection((prev) => {
        const nextMap = new Map(prev);
        if (allSelected) nextMap.delete(datasetId);
        else nextMap.set(datasetId, new Set(selectable));
        return nextMap;
      });
    },
    [selectableByDataset, datasetCheckState]
  );

  return {
    selection,
    activeSelectionModel,
    setActiveSelection,
    numSelectedFiles,
    clearSelection,
    datasetCheckState,
    allCheckState,
    toggleAll,
    toggleDataset,
  };
}
