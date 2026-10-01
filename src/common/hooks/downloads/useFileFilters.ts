import { useState, type Dispatch, type SetStateAction } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import {
  hasActiveFilter,
  passesFilter,
  selectedValuesForField,
  withFieldFilter,
} from "@/common/components/Downloads/filterModel";
import type { CatalogFile } from "@/common/components/Downloads/types";
import type { MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";

const FILE_TYPE_FIELD = "file_type";

export type FileFiltersState = {
  fileFilterModel: GridFilterModel;
  setFileFilterModel: Dispatch<SetStateAction<GridFilterModel>>;
  fileTypeOptions: string[];
  fileSelectedValues: string[];
  handleFileTypeSelectChange: MultiSelectOnChange<string>;
  hasActiveFileFilter: boolean;
  /** Predicate applying the current file-type filter to a single file. */
  passesFileFilter: (file: CatalogFile) => boolean;
};

/**
 * Owns the right-pane (file) filter state. Currently a single file-type facet,
 * but it keeps the same GridFilterModel shape so more facets can be added.
 *
 * Unmemoized by design — React Compiler caches these derivations, including the
 * identity of `passesFileFilter`, which callers use as a dependency.
 */
export function useFileFilters(files: CatalogFile[]): FileFiltersState {
  const [fileFilterModel, setFileFilterModel] = useState<GridFilterModel>({ items: [] });

  const fileTypeOptions = [...new Set(files.flatMap((f) => (f.file_type ? [f.file_type] : [])))];

  const fileSelectedValues = selectedValuesForField(FILE_TYPE_FIELD, fileFilterModel, fileTypeOptions);

  const handleFileTypeSelectChange: MultiSelectOnChange<string> = (_event, value) => {
    setFileFilterModel((prev) => withFieldFilter(prev, FILE_TYPE_FIELD, value, fileTypeOptions));
  };

  const passesFileFilter = (file: CatalogFile): boolean =>
    passesFilter(file as unknown as Record<string, unknown>, fileFilterModel);

  return {
    fileFilterModel,
    setFileFilterModel,
    fileTypeOptions,
    fileSelectedValues,
    handleFileTypeSelectChange,
    hasActiveFileFilter: hasActiveFilter(fileFilterModel),
    passesFileFilter,
  };
}
