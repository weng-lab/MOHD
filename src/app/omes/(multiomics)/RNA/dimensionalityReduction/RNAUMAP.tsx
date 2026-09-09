import { RNAMetadata, SharedRNADimenionalityProps } from "./page";
import { ChartProps } from "@weng-lab/visualization";
import DimensionalityScatterPlot from "@/common/components/DimensionalityScatterPlot";


export type RNADimensionalityUmapProps<
  S extends boolean | undefined,
  Z extends boolean | undefined,
> = SharedRNADimenionalityProps & Partial<ChartProps<RNAMetadata[number], S, Z>>;

const TooltipBody = (point: Point<RNAMetadata[number]>) => {
  return (
    <>
      <Typography>
        <b>Dataset:</b> {point.metaData?.sample_id}
      </Typography>
      <Typography>
        <b>Status:</b> {point.metaData?.status}
      </Typography>
      <Typography>
        <b>Site:</b> {point.metaData?.site}
      </Typography>
      <Typography>
        <b>Sex:</b>{" "}
        {point.metaData?.sex ? point.metaData.sex.charAt(0).toUpperCase() + point.metaData.sex.slice(1) : ""}
      </Typography>
    </>
  );
};

const RNAUMAP = <S extends true, Z extends boolean | undefined>({
  selected,
  RNAData,
  setSelected,
  ref,
  ...rest
}: RNADimensionalityUmapProps<S, Z>) => {
    const { loading, data } = RNAData;

    return (
        <DimensionalityScatterPlot
            {...rest}
            ref={ref}
            data={data}
            loading={loading}
            selected={selected}
            setSelected={setSelected}
            getX={(row) => row.umap_x}
            getY={(row) => row.umap_y}
            leftAxisLabel="UMAP-2"
            bottomAxisLabel="UMAP-1"
            downloadFileName="RNA_dimesionality_reduction_UMAP"
        />
    );
}

export default RNAUMAP;
