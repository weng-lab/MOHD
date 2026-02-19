import { OME_COLORS } from "@/common/colors";
import { Stack, Paper, Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

export const OmeHeader = ({ children }: { children?: React.ReactNode }) => {
    const pathname = usePathname();
    const ome = pathname.split("/")[2];
    const seq = ome === "RNA" || ome === "ATAC"

    const color = OME_COLORS[ome.toLowerCase()] || "gray";
    const image = `/OmeIcons/${ome.toLowerCase().split("-")[0]}.png`;

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
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: color,
                                opacity: 0.08,
                                pointerEvents: "none",
                            }}
                        />
                        <Box
                            sx={{
                                width: 12,
                                backgroundColor: color,
                            }}
                        />
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ px: 2, py: 1, flex: 1 }}
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
                                width={40}
                                height={40}
                            />
                        </Stack>
                    </Stack>
                    <Button 
                        startIcon={<ArrowLeftIcon />}
                        href="/omes"
                        variant="text"
                    >
                        All Omes
                    </Button>
                </Stack>
            </Paper>
            {children}
        </Box>
    );
};
