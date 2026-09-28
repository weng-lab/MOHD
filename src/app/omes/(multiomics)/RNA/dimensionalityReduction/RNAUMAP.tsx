import { SharedRNADimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

const RNAUMAP = ({ RNAData, sampleTable, ref }: SharedRNADimenionalityProps) => {
  const { loading } = RNAData;

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      ref={ref}
      loading={loading}
      getX={(row) => row.umap_x}
      getY={(row) => row.umap_y}
      leftAxisLabel="UMAP-2"
      bottomAxisLabel="UMAP-1"
      downloadFileName="RNA_dimesionality_reduction_UMAP"
    />
  );
};

export default RNAUMAP;
