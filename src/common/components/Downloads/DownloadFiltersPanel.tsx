import type { ReactNode } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Divider,
  FormLabel,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ExpandMore, FilterList, FilterListOff } from "@mui/icons-material";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import MultiSelect, { type MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";
import { activeFilterCount } from "@/common/components/Downloads/filterModel";
import { theme } from "@/app/theme";

const ControlLabelWrapper = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box width={"auto"}>
    <FormLabel>{label}</FormLabel>
    {children}
  </Box>
);

/**
 * Reset button for a filter group. Stops click propagation so the instance inside
 * the accordion summary doesn't also toggle the accordion open/closed.
 */
const ResetFiltersButton = ({
  label,
  onReset,
}: {
  label: string;
  onReset: () => void;
}) => (
  <Tooltip title={label}>
    <IconButton
      size="small"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onReset();
      }}
      sx={{ p: 0 }} // prevents layout shift
    >
      <FilterListOff fontSize="small" />
    </IconButton>
  </Tooltip>
);

/** Section heading with an active-filter count chip and an inline reset button. */
const FilterSectionHeader = ({
  title,
  activeCount,
  resetLabel,
  onReset,
}: {
  title: string;
  activeCount: number;
  resetLabel: string;
  onReset: () => void;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Typography>{title}</Typography>
    {activeCount > 0 && (
      <>
        <Chip size="small" label={activeCount} color="primary" />
        <ResetFiltersButton label={resetLabel} onReset={onReset} />
      </>
    )}
  </Stack>
);

const accordionSx = {
  border: (theme: { palette: { primary: { main: string } } }) => `1px solid ${theme.palette.primary.main}`,
  borderRadius: 1,
  backgroundColor: "surface.light",
};

const datasetToggleSx = {
  gap: 1,
  display: "flex",
  "&.MuiToggleButtonGroup-root": {
    display: "flex",
  },
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    border: "none",
  },
  "& .MuiToggleButton-root": {
    border: `1px solid ${theme.palette.primary.main} !important`,
    textTransform: "none",
    borderRadius: 1,
    py: 0.25,

    // base (unselected)
    color: "primary.main",
    borderColor: "primary.main",
    opacity: 0.5,
    backgroundColor: "transparent",

    // remove default MUI selected bg
    "&.Mui-selected": {
      color: "primary.main",
      borderColor: "primary.main",
      backgroundColor: "transparent",
      opacity: 1,
    },
  },
};

type DownloadFiltersPanelProps = {
  // Only field/label are read here, so accept any filter config regardless of
  // the caller's metadata type.
  datasetFilters: readonly { field: string; label: string }[];
  datasetOptionsMap: Record<string, string[]>;
  datasetSelectedValues: Record<string, string[]>;
  onDatasetToggle: (field: string, value: string[] | null) => void;
  datasetFilterModel: GridFilterModel;
  onResetDatasetFilters: () => void;

  fileTypeOptions: string[];
  fileSelectedValues: string[];
  onFileTypeChange: MultiSelectOnChange<string>;
  fileFilterModel: GridFilterModel;
  onResetFileFilters: () => void;
};

/** The collapsible Filters accordion: dataset toggle facets + file-type facet. */
export default function DownloadFiltersPanel({
  datasetFilters,
  datasetOptionsMap,
  datasetSelectedValues,
  onDatasetToggle,
  datasetFilterModel,
  onResetDatasetFilters,
  fileTypeOptions,
  fileSelectedValues,
  onFileTypeChange,
  fileFilterModel,
  onResetFileFilters,
}: DownloadFiltersPanelProps) {
  const muiTheme = useTheme();
  const mdUp = useMediaQuery(muiTheme.breakpoints.up("md"));

  const datasetActiveCount = activeFilterCount(datasetFilterModel);
  const fileActiveCount = activeFilterCount(fileFilterModel);
  const totalActiveFilterCount = datasetActiveCount + fileActiveCount;

  const handleResetAllFilters = () => {
    onResetDatasetFilters();
    onResetFileFilters();
  };

  return (
    <Accordion disableGutters elevation={0} sx={{ ...accordionSx, mb: 1 }}>
      {/*
        `component="div"` keeps the summary from rendering a native <button>, which
        cannot legally contain the reset <button> below.
      */}
      <AccordionSummary component="div" expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <FilterList fontSize="small" />
          <Typography>Filters</Typography>
          {totalActiveFilterCount > 0 && (
            <>
              <Chip size="small" label={totalActiveFilterCount} color="primary" />
              <ResetFiltersButton label="Reset All Filters" onReset={handleResetAllFilters} />
            </>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto auto auto" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box>
            <FilterSectionHeader
              title="Dataset Filters"
              activeCount={datasetActiveCount}
              resetLabel="Reset Dataset Filters"
              onReset={onResetDatasetFilters}
            />
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={2}
              alignItems="flex-start"
              sx={{ width: "fit-content" }}
            >
              {datasetFilters.map((filter) => (
                <ControlLabelWrapper key={filter.field} label={filter.label}>
                  <ToggleButtonGroup
                    value={datasetSelectedValues[filter.field] ?? []}
                    onChange={(_, value) => onDatasetToggle(filter.field, value)}
                    size="small"
                    sx={datasetToggleSx}
                  >
                    {(datasetOptionsMap[filter.field] ?? []).map((option) => (
                      <ToggleButton key={option} value={option}>
                        {option}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </ControlLabelWrapper>
              ))}
            </Stack>
          </Box>
          <Divider orientation={mdUp ? "vertical" : "horizontal"} flexItem sx={{ display: "flex" }} />
          <Box>
            <FilterSectionHeader
              title="File Filters"
              activeCount={fileActiveCount}
              resetLabel="Reset File Filters"
              onReset={onResetFileFilters}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}>
              <ControlLabelWrapper label="File Type">
                <MultiSelect
                  limitTags={5}
                  chipMaxWidth={100}
                  options={fileTypeOptions}
                  value={fileSelectedValues}
                  onChange={onFileTypeChange}
                  placeholder="File Type"
                />
              </ControlLabelWrapper>
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
