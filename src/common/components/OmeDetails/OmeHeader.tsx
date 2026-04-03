import { Stack, Paper, Box, Typography, IconButton } from "@mui/material";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AppsIcon from '@mui/icons-material/Apps';
import { useState } from "react";
import { OmesDataType } from "@/common/types/globalTypes";
import OmeAppletsPopover from "./OmeAppletsPopover";

export const OmeHeader = ({ children }: { children?: React.ReactNode }) => {
    const pathname = usePathname();
    const ome = pathname.split("/")[2] as OmesDataType;
    const seq = ome === "RNA" || ome === "ATAC";
    const image = `/OmeIcons/NoBgrnd/${ome.toLowerCase().split("-")[0]}.png`;
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
                sx={{ position: "sticky", top: "var(--header-height, 64px)", zIndex: 61 }}
                id="ome-header"
            >
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack direction="row" alignItems="stretch">
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ p: 1, flex: 1 }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    textTransform: seq ? "none" : "capitalize",
                                    lineHeight: 1.1,
                                }}
                            >
                                {seq ? ome + "-seq" : ome}
                            </Typography>
                            {(ome === "WGS" || ome === "WGBS") && (
                                <Typography
                                    variant="body1"
                                >
                                    {ome === "WGBS" ? "(Whole Genome Bisulfate Sequencing)" : "(Whole Genome Sequencing)"}
                                </Typography>
                            )}
                            <Image
                                src={image}
                                alt={`${ome} icon`}
                                width={50}
                                height={50}
                            />
                        </Stack>
                    </Stack>
                    <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
                        <IconButton
                            onClick={handleOpenApplets}
                            sx={{
                                color: "text.primary",
                            }}
                        >
                            <AppsIcon fontSize="large" />
                        </IconButton>
                        <OmeAppletsPopover
                            anchorEl={appletsAnchor}
                            currentOme={ome}
                            onClose={handleCloseApplets}
                        />
                    </Box>
                </Stack>
            </Paper>
            {children}
        </Box>
    );
};
