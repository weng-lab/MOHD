import { use } from "react";
import type { TrackRuntimeContext, TrackTooltipComponent } from "@weng-lab/genomebrowser";
import { bigBedModule, type BigBedConfig, type BigBedRow } from "@weng-lab/genomebrowser-tracks/bigbed";
import { bigWigModule, type BigWigConfig } from "@weng-lab/genomebrowser-tracks/bigwig";
import {
  methylCModule,
  type MethylCConfig,
  type MethylCShowRows,
  type MethylCTooltipItem,
} from "@weng-lab/genomebrowser-tracks/methylc";
import {
  TrackTooltip,
  formatGenomicInterval,
  formatOptionalBedValue,
  formatSignalValue,
  type SignalPoint,
  type TrackTooltipRow,
} from "@weng-lab/genomebrowser-tracks/shared";
import { fieldsFor, groupOf, labelOf, type SampleGroups } from "@/common/sampleFields/fields";
import { MohdTooltipContext } from "./mohdTooltipContext";

/**
 * Hovering a MOHD track names its sample and the sample's metadata, as a point on the ome's PCA
 * does: the same fields, labeled the same way, under the module's own rows. The metadata comes
 * from the catalog, through MohdTooltipContext.
 */

/** The hovered track's sample as a title and rows, or null for a track outside the catalog. */
function useSampleTooltip(context: TrackRuntimeContext<unknown>) {
  const info = use(MohdTooltipContext)?.get(context.base.id);
  if (!info) return null;

  const sample: SampleGroups = {
    sample_id: info.sampleId,
    // Every sample in the catalog is a participant's: each has a status, which QC material lacks.
    qc: false,
    site: info.site,
    status: info.status,
    sex: info.sex,
    protocol: info.protocol,
    age_bin: info.ageBin,
  };

  return {
    title: info.sampleId,
    rows: fieldsFor(info.ome).map(({ key, label }): TrackTooltipRow => ({
      label,
      value: labelOf(key, groupOf(key, sample)),
    })),
  };
}

// The modules' own tooltips, for tracks outside the catalog.
const BigWigTooltip = bigWigModule.tooltipComponent!;
const BigBedTooltip = bigBedModule.tooltipComponent!;
const MethylCTooltip = methylCModule.tooltipComponent!;

/** bigWig's row - the hovered pixel's maximum - then the sample's. */
const MohdSignalTooltip: TrackTooltipComponent<SignalPoint, BigWigConfig> = (props) => {
  const sample = useSampleTooltip(props.context);
  if (!sample) return <BigWigTooltip {...props} />;

  return (
    <TrackTooltip
      title={sample.title}
      rows={[{ label: "Signal", value: formatSignalValue(props.item.max) }, ...sample.rows]}
    />
  );
};

/** bigBed's rows, with the peak's name moved down from the title to make way for the sample. */
const MohdPeakTooltip: TrackTooltipComponent<BigBedRow, BigBedConfig> = (props) => {
  const sample = useSampleTooltip(props.context);
  if (!sample) return <BigBedTooltip {...props} />;

  const { item } = props;
  const name = formatOptionalBedValue(item.name);
  const strand = formatOptionalBedValue(item.strand);
  const score = formatOptionalBedValue(item.score);

  return (
    <TrackTooltip
      title={sample.title}
      rows={[
        ...(name ? [{ label: "Name", value: name }] : []),
        {
          label: "Location",
          value: formatGenomicInterval(item.start, item.end, formatOptionalBedValue(item.chromosome)),
        },
        ...(strand ? [{ label: "Strand", value: strand }] : []),
        ...(score ? [{ label: "Score", value: score }] : []),
        ...sample.rows,
      ]}
    />
  );
};

/** MethylC's channel rows, in the module's order: tooltipValues is indexed by position here. */
const METHYLC_CHANNELS: { key: keyof MethylCShowRows; label: string; channel: keyof MethylCConfig["colors"] }[] = [
  { key: "fwdCpg", label: "Plus CpG", channel: "cpg" },
  { key: "fwdChg", label: "Plus CHG", channel: "chg" },
  { key: "fwdChh", label: "Plus CHH", channel: "chh" },
  { key: "fwdDepth", label: "Plus depth", channel: "depth" },
  { key: "revCpg", label: "Minus CpG", channel: "cpg" },
  { key: "revChg", label: "Minus CHG", channel: "chg" },
  { key: "revChh", label: "Minus CHH", channel: "chh" },
  { key: "revDepth", label: "Minus depth", channel: "depth" },
];

const MohdMethylTooltip: TrackTooltipComponent<MethylCTooltipItem, MethylCConfig> = (props) => {
  const sample = useSampleTooltip(props.context);
  if (!sample) return <MethylCTooltip {...props} />;

  const { item, context } = props;
  const channels = METHYLC_CHANNELS.flatMap(({ key, label, channel }, index): TrackTooltipRow[] =>
    item.showRows[key]
      ? [{ label, value: formatSignalValue(item.tooltipValues[index]?.max), color: context.config.colors[channel] }]
      : []
  );

  return (
    <TrackTooltip
      title={sample.title}
      rows={[...(channels.length ? channels : [{ label: "Channels", value: "None enabled" }]), ...sample.rows]}
    />
  );
};

// Only components leave this file, so Fast Refresh can swap it in place - index.ts builds the modules.
export { MohdMethylTooltip, MohdPeakTooltip, MohdSignalTooltip };
