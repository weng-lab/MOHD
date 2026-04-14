import { Search } from "@mui/icons-material";
import { IconButton, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { Chromosome } from "@weng-lab/genomebrowser";
import { GenomeSearch, Result } from "@weng-lab/ui-components";
import { useBrowserStore } from "../stores";

const ASSEMBLY = "GRCh38";
const GENE_VERSION = [29, 40];

export default function BrowserSearch() {
  const theme = useTheme();
  const setDomain = useBrowserStore(state => state.setDomain)

  const handleSearchSubmit = (result: Result) => {
    if (!result.domain) return;
    setDomain({
      chromosome: result.domain.chromosome as Chromosome,
      start: result.domain.start,
      end: result.domain.end,
    });
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "auto" },
        minWidth: { md: 300 },
        maxWidth: { md: 450 },
        flex: { md: 1 },
      }}
    >
      <GenomeSearch
        size="small"
        assembly={ASSEMBLY}
        geneVersion={GENE_VERSION}
        onSearchSubmit={handleSearchSubmit}
        queries={["Gene", "SNP", "cCRE", "Coordinate"]}
        geneLimit={3}
        sx={{ width: "100%" }}
        slots={{
          button: (
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <Search />
            </IconButton>
          ),
        }}
        slotProps={{
          input: {
            label: "Change Browser Region",
            sx: {
              backgroundColor: "white",
              "& label.Mui-focused": {
                color: theme.palette.primary.main,
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            },
          },
        }}
      />
    </Box>
  );
}
