import { Stack, Paper, Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AppsIcon from "@mui/icons-material/Apps";
import { useState } from "react";
import { OmesDataType } from "@/common/types/globalTypes";
import OmeAppletsPopover from "./OmeAppletsPopover";
import { OmeHeaderInfoCards } from "./OmeHeaderInfoCards";

export const OmeHeader = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();
  const ome = pathname.split("/")[2] as OmesDataType;
  const seq = ome === "RNA" || ome === "ATAC";
  const image = `/OmeIcons/Light/${ome.toLowerCase().split("-")[0]}.png`;
  const [appletsAnchor, setAppletsAnchor] = useState<HTMLElement | null>(null);

  const handleOpenApplets = (event: React.MouseEvent<HTMLElement>) => {
    setAppletsAnchor(event.currentTarget);
  };

  const handleCloseApplets = () => {
    setAppletsAnchor(null);
  };

  return (
    <Box
      display={"grid"}
      height={"100%"}
      gridTemplateRows={"auto minmax(0, 1fr)"}
      gridTemplateColumns={"minmax(0, 1fr)"}
    >
      {/* z index of scrollbar in DataGrid is 60 */}
      <Paper
        elevation={1}
        square
        sx={{
          position: "sticky",
          top: "var(--header-height, 64px)",
          zIndex: 61,
          background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, #336460)`,
          py: 1,
          px: 2,
        }}
        id="ome-header"
      >
        <Stack>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 700,
                  textTransform: seq ? "none" : "capitalize",
                  minWidth: 0,
                  flexShrink: 1,
                }}
                color="white"
              >
                {seq ? ome + "-seq" : ome}
              </Typography>
              {(ome === "WGS" || ome === "WGBS") && (
                <Typography variant="body1" color="white" noWrap sx={{ minWidth: 0, flexShrink: 1 }}>
                  {ome === "WGBS" ? "(Whole Genome Bisulfite Sequencing)" : "(Whole Genome Sequencing)"}
                </Typography>
              )}
              <Box sx={{ flexShrink: 0, lineHeight: 0 }}>
                <Image src={image} alt={`${ome} icon`} width={50} height={50} />
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <OmeHeaderInfoCards key={ome} ome={ome} />
              </Box>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <Button
                onClick={handleOpenApplets}
                variant="text"
                size="large"
                sx={{
                  color: "white",
                  minWidth: 0,
                  gap: 1,
                }}
              >
                <AppsIcon />
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Omes
                </Box>
              </Button>
              <OmeAppletsPopover anchorEl={appletsAnchor} currentOme={ome} onClose={handleCloseApplets} />
            </Box>
          </Stack>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <OmeHeaderInfoCards key={ome} ome={ome} />
          </Box>
        </Stack>
      </Paper>
      {children}
    </Box>
  );
};
