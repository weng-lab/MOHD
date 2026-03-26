import { Stack, Paper, Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

export const OmeHeader = ({ children }: { children?: React.ReactNode }) => {
    const pathname = usePathname();
    const ome = pathname.split("/")[2];
    const seq = ome === "RNA" || ome === "ATAC"
    const image = `/OmeIcons/NoBgrnd/${ome.toLowerCase().split("-")[0]}.png`;

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
