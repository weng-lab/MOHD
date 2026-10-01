import { SharedWGBSDimenionalityProps } from "./page";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";

const WGBSUMAP = ({ WGBSData, sampleTable, ref }: SharedWGBSDimenionalityProps) => {
  const { loading } = WGBSData;

  return (
    <DimensionalityScatterPlot
      table={sampleTable}
      ref={ref}
      loading={loading}
      getX={(row) => row.umap_x}
      getY={(row) => row.umap_y}
      leftAxisLabel="UMAP-2"
      bottomAxisLabel="UMAP-1"
      downloadFileName="WGBS_dimesionality_reduction_UMAP"
    />
  );
};

export default WGBSUMAP;
