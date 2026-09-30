import { SharedATACDimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

const ATACUMAP = ({ ATACData, sampleTable, ref }: SharedATACDimenionalityProps) => {
  const { loading } = ATACData;

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      ref={ref}
      loading={loading}
      getX={(row) => row.umap_x}
      getY={(row) => row.umap_y}
      leftAxisLabel="UMAP-2"
      bottomAxisLabel="UMAP-1"
      downloadFileName="ATAC_dimesionality_reduction_UMAP"
    />
  );
};

export default ATACUMAP;
