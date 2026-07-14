import type { ReactNode } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  Divider,
  FormLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ExpandMore, FilterList, FilterListOff } from "@mui/icons-material";
import type { GridFilterModel } from "@mui/x-data-grid-premium";
import MultiSelect, { type MultiSelectOnChange } from "@/common/components/Downloads/MultiSelect";
import { theme } from "@/app/theme";

const ControlLabelWrapper = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box width={"auto"}>
    <FormLabel>{label}</FormLabel>
    {children}
  </Box>
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
  hasActiveDatasetFilter: boolean;
  datasetFilterModel: GridFilterModel;
  onResetDatasetFilters: () => void;

  fileTypeOptions: string[];
  fileSelectedValues: string[];
  onFileTypeChange: MultiSelectOnChange<string>;
  hasActiveFileFilter: boolean;
  fileFilterModel: GridFilterModel;
  onResetFileFilters: () => void;
};

/** The collapsible Filters accordion: dataset toggle facets + file-type facet. */
export default function DownloadFiltersPanel({
  datasetFilters,
  datasetOptionsMap,
  datasetSelectedValues,
  onDatasetToggle,
  hasActiveDatasetFilter,
  datasetFilterModel,
  onResetDatasetFilters,
  fileTypeOptions,
  fileSelectedValues,
  onFileTypeChange,
  hasActiveFileFilter,
  fileFilterModel,
  onResetFileFilters,
}: DownloadFiltersPanelProps) {
  const muiTheme = useTheme();
  const mdUp = useMediaQuery(muiTheme.breakpoints.up("md"));

  const totalActiveFilterCount = datasetFilterModel.items.length + fileFilterModel.items.length;

  return (
    <Accordion disableGutters elevation={0} sx={{ ...accordionSx, mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <FilterList fontSize="small" />
          <Typography>Filters</Typography>
          {totalActiveFilterCount > 0 && (
            <Chip size="small" label={totalActiveFilterCount} color="primary" />
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Typography>Dataset Filters</Typography>
              {hasActiveDatasetFilter && (
                <Chip size="small" label={datasetFilterModel.items.length} color="primary" />
              )}
            </Stack>
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
            {hasActiveDatasetFilter && (
              <Box sx={{ width: "100%" }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FilterListOff />}
                  onClick={onResetDatasetFilters}
                  sx={{ mt: 2 }}
                >
                  Reset Dataset Filters
                </Button>
              </Box>
            )}
          </Box>
          <Divider orientation={mdUp ? "vertical" : "horizontal"} flexItem sx={{ display: "flex" }} />
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Typography>File Filters</Typography>
              {hasActiveFileFilter && (
                <Chip size="small" label={fileFilterModel.items.length} color="primary" />
              )}
            </Stack>
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
            {hasActiveFileFilter && (
              <Box sx={{ width: "100%" }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FilterListOff />}
                  onClick={onResetFileFilters}
                  sx={{ mt: 2 }}
                >
                  Reset File Filters
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
