import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
 */
export function useFileFilters(files: CatalogFile[]): FileFiltersState {
  const [fileFilterModel, setFileFilterModel] = useState<GridFilterModel>({ items: [] });

  const fileTypeOptions = useMemo(
    () => [...new Set(files.map((f) => f.file_type).filter(Boolean))],
    [files]
  );

  const fileSelectedValues = useMemo(
    () => selectedValuesForField(FILE_TYPE_FIELD, fileFilterModel, fileTypeOptions),
    [fileFilterModel, fileTypeOptions]
  );

  const handleFileTypeSelectChange: MultiSelectOnChange<string> = useCallback(
    (_event, value) => {
      setFileFilterModel((prev) => withFieldFilter(prev, FILE_TYPE_FIELD, value, fileTypeOptions));
    },
    [fileTypeOptions]
  );

  const passesFileFilter = useCallback(
    (file: CatalogFile): boolean =>
      passesFilter(file as unknown as Record<string, unknown>, fileFilterModel),
    [fileFilterModel]
  );

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
