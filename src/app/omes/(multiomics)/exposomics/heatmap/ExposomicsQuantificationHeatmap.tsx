import { ColumnDatum } from "@weng-lab/visualization";
import { Typography } from "@mui/material";
import { SharedExposomicsProps } from "./page";
import { ExposomicsSample } from "@/common/hooks/omeHooks/useExposomicsData";
import OmeHeatmapShell from "@/common/components/OmeQuantification/OmeHeatmapShell";

const truncateMoleculeName = (name: string) => (name.length > 10 ? `${name.slice(0, 10)}…` : name);

type MoleculeRowMeta = { fullName: string; formula: string; ionType: string; precursorMz: number | null };

const ExposomicsQuantificationHeatmap = ({
  exposomicsData,
  sortedFilteredData,
  selected,
  setSelected,
  autoSort,
  ref,
}: SharedExposomicsProps) => {
  const { loading } = exposomicsData;

  const samples: ExposomicsSample[] = sortedFilteredData;

  const molecules = Array.from(
    new Map(samples.flatMap((sample) => sample.quantification.map((q) => [q.position, q] as const))).values()
  ).sort((a, b) => a.position - b.position);

  const heatmapData: ColumnDatum<ExposomicsSample, MoleculeRowMeta>[] = samples.map((sample) => {
    const valueByPosition = new Map(sample.quantification.map((q) => [q.position, q.value]));

    return {
      columnName: sample.sample_id,
      metadata: sample,
      rows: molecules.map((molecule) => ({
        rowName: truncateMoleculeName(molecule.molecule_name || "Unknown"),
        count: valueByPosition.get(molecule.position) ?? null,
        metadata: {
          fullName: molecule.molecule_name || "Unknown",
          formula: molecule.formula,
          ionType: molecule.precursor_ion_type,
          precursorMz: molecule.precursor_mz,
        },
      })),
    };
  });

  return (
    <OmeHeatmapShell
      loading={loading}
      samples={samples}
      heatmapData={heatmapData}
      selected={selected}
      setSelected={setSelected}
      autoSort={autoSort}
      yLabel="Molecule"
      downloadFileName="exposomics_quantification_heatmap"
      ref={ref}
      tooltipBody={(bin) => {
        const rowMeta = bin.bin.metadata as MoleculeRowMeta | undefined;
        return (
          <>
            <Typography>
              <b>Dataset:</b> {bin.datum.columnName}
            </Typography>
            <Typography>
              <b>Molecule:</b> {rowMeta?.fullName ?? bin.bin.rowName}
            </Typography>
            {rowMeta?.formula ? (
              <Typography>
                <b>Formula:</b> {rowMeta.formula}
              </Typography>
            ) : null}
            {rowMeta?.ionType ? (
              <Typography>
                <b>Ion Type:</b> {rowMeta.ionType}
              </Typography>
            ) : null}
            {rowMeta?.precursorMz != null ? (
              <Typography>
                <b>Precursor m/z:</b> {rowMeta.precursorMz}
              </Typography>
            ) : null}
            <Typography>
              <b>Value:</b> {bin.bin.count ?? "No data"}
            </Typography>
          </>
        );
      }}
    />
  );
};

export default ExposomicsQuantificationHeatmap;
