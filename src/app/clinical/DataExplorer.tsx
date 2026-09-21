"use client";
import { useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { usePhenotypicalVariables } from "@/common/hooks/usePhenotypicalVariables";
import { usePhenotypicalData } from "@/common/hooks/usePhenotypicalData";
import usePlotDownload from "@/common/hooks/usePlotDownload";
import PlotDownloadButton from "@/common/components/PlotDownloadButton";
import PlotSelector from "./charts/PlotSelector";
import TreeSelect from "./TreeSelect";
import { EXCLUDED_VARIABLE_NAMES, FORCE_QUANTITATIVE_VARIABLE_NAMES, plotHeading } from "./helpers";

/** The variable's category, defaulting to Categorical when the data omits one. */
function CategoryChip({ category }: { category?: string | null }) {
  return (
    <Chip
      label={category ?? "Categorical"}
      variant="outlined"
      size="small"
      sx={{ alignSelf: "flex-start", borderColor: "primary.main", color: "primary.main" }}
    />
  );
}

export default function DataExplorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, loading: varsLoading } = usePhenotypicalVariables();
  const variables = (data ?? [])
    .filter((v) => !EXCLUDED_VARIABLE_NAMES.has(v.variable_name))
    .map((v) =>
      FORCE_QUANTITATIVE_VARIABLE_NAMES.has(v.variable_name) ? { ...v, variable_category: "Quantitative" } : v
    );

  const var1Name = searchParams.get("variable") ?? "";

  const effectiveVar1 = var1Name || variables[0]?.variable_name || "";

  const selectedVar = variables.find((v) => v.variable_name === effectiveVar1);

  const varNames = effectiveVar1 ? [effectiveVar1] : [];
  const { data: rawData, loading: dataLoading } = usePhenotypicalData(varNames, !effectiveVar1);

  const { ref: plotRef, onDownloadPNG, onDownloadSVG } = usePlotDownload();
  const showDownload = !dataLoading && (rawData?.length ?? 0) > 0;

  /**
   * Syncs the selected variable into the URL (via history.replaceState, not the Next.js router)
   * so the address bar always reflects the current chart and can be copied/shared as a deep
   * link - a plain navigation would trigger a server round-trip and reset scroll for no reason,
   * since nothing here needs re-rendering from the server.
   */
  const setVar1Name = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variable", name);
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams]
  );

  // Backfills the default (first) variable into the URL once the variable list loads, so a link
  // copied before anyone touches the selector still deep-links to what's actually on screen.
  useEffect(() => {
    if (!var1Name && effectiveVar1) setVar1Name(effectiveVar1);
  }, [var1Name, effectiveVar1, setVar1Name]);

  return (
    <Box sx={{ px: { xs: 3, sm: 4, md: 8, lg: 10 }, py: 4, width: "100%", overflow: "hidden" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Data Explorer
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "primary.light",
          backgroundColor: "surface.light",
          borderRadius: 1,
          p: 2.5,
          mb: 3,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>SELECT</Typography>
        <Stack spacing={1} mt={2} sx={{ maxWidth: { md: "50%" } }}>
          <TreeSelect
            variables={variables}
            value={effectiveVar1}
            onChange={setVar1Name}
            label="Variable"
            disabled={varsLoading}
          />
          <CategoryChip category={selectedVar?.variable_category} />
        </Stack>
      </Box>
      <Box
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "primary.light",
          backgroundColor: "surface.light",
          borderRadius: 1,
          pt: 3,
          px: 3,
          pb: { xs: 6, sm: 7 },
          overflow: "hidden",
          width: "100%",
        }}
      >
        {showDownload && <PlotDownloadButton onDownloadPNG={onDownloadPNG} onDownloadSVG={onDownloadSVG} />}
        <Typography variant="subtitle1" fontWeight={500} textAlign="center" mb={2}>
          {plotHeading(effectiveVar1)}
        </Typography>
        <Box
          sx={{
            height: { xs: 320, sm: 420, md: 600 },
            overflow: "hidden",
            width: "100%",
            minWidth: 0,
            "& > div": { minWidth: "0 !important" },
          }}
        >
          <PlotSelector
            ref={plotRef}
            var1Name={effectiveVar1}
            var1Category={selectedVar?.variable_category ?? null}
            rawData={rawData ?? []}
            loading={dataLoading}
          />
        </Box>
      </Box>
    </Box>
  );
}
