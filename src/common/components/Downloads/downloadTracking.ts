import { createContext } from "react";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import { trackDownload, trackRestrictedFileRequest } from "@/common/analytics";
import { isFileBulkSelectable } from "@/common/downloads";
import type { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";
import { fileTypesOf, searchOf, subsetOf } from "@/common/components/Downloads/describeDownload";
import { selectedFileTypes, type BulkDownloadDatasetItem } from "@/common/components/Downloads/selectionSummary";
import type {
  BaseSampleMetadata,
  CatalogDataset,
  CatalogFile,
  DatasetBundle,
  OmeFile,
} from "@/common/components/Downloads/types";

/** One call for each way a downloads page downloads, made as the download starts. */
export type DownloadTracking = {
  /** A file's own download link. */
  file: (file: CatalogFile) => void;
  /** A dataset's "Download all". */
  bundle: (bundle: DatasetBundle) => void;
  /** An ome-wide file, the joined quantifications. */
  joinedQuant: (file: OmeFile) => void;
  /** A bulk job, once the service has accepted it, so a failed submit that's tried again counts once. */
  bulk: (format: BulkDownloadFormat) => void;
  /** A link to AnVIL: a restricted file's, or the restricted-access banner's, which names no type. */
  restricted: (fileType: string | null) => void;
};

/**
 * The page's tracking, for its download links. Through context rather than props because the file
 * grid's download cell is one of them: a column def closing over the search would change with each
 * keystroke, and the Table's autosize can revert a column def that changes (see SelectAllHeader).
 */
export const DownloadTrackingContext = createContext<DownloadTracking | null>(null);

type DownloadPage<T extends BaseSampleMetadata> = {
  omeKey: string;
  datasets: CatalogDataset<T>[];
  /** The dataset fields the page filters by, which a bulk job's subset is described in. */
  datasetColumns: string[];
  datasetFilterModel: GridFilterModel;
  selection: ReadonlyMap<string, ReadonlySet<string>>;
  filesByDataset: ReadonlyMap<string, CatalogFile[]>;
  bulkDownloadItems: BulkDownloadDatasetItem[];
  totalSize: number;
};

/**
 * Builds a downloads page's tracking from its state as it renders. What only a download needs -
 * the open datasets and file types, a bulk job's subset - is worked out when one happens.
 */
export function downloadTracking<T extends BaseSampleMetadata>({
  omeKey: ome,
  datasets,
  datasetColumns,
  datasetFilterModel,
  selection,
  filesByDataset,
  bulkDownloadItems,
  totalSize,
}: DownloadPage<T>): DownloadTracking {
  const search = searchOf(datasetFilterModel);

  // Every dataset with a file to download: what "all" means, and what a subset is a slice of.
  const openDatasets = () => datasets.filter((dataset) => dataset.files.some(isFileBulkSelectable));
  const openTypes = () =>
    new Set(datasets.flatMap((dataset) => dataset.files.filter(isFileBulkSelectable).map((file) => file.file_type)));

  return {
    file: (file) =>
      trackDownload({
        ome,
        method: "file",
        fileTypes: fileTypesOf([file.file_type], openTypes()),
        bytes: file.size ?? 0,
        datasets: 1,
        subset: null,
        search,
      }),
    bundle: (bundle) =>
      trackDownload({
        ome,
        method: "dataset_bundle",
        // A bundle holds every open file its dataset has.
        fileTypes: "all",
        bytes: bundle.size,
        datasets: 1,
        subset: null,
        search,
      }),
    joinedQuant: (file) =>
      trackDownload({
        ome,
        method: "joined_quant",
        fileTypes: file.file_type,
        bytes: file.size,
        datasets: openDatasets().length,
        subset: "all",
        search,
      }),
    bulk: (format) =>
      trackDownload({
        ome,
        method: `bulk_${format}`,
        fileTypes: fileTypesOf(selectedFileTypes(selection, filesByDataset), openTypes()),
        bytes: totalSize,
        datasets: bulkDownloadItems.length,
        subset: subsetOf(new Set(bulkDownloadItems.map((item) => item.sampleId)), openDatasets(), datasetColumns),
        search,
      }),
    restricted: (fileType) => trackRestrictedFileRequest({ ome, fileType, search }),
  };
}
