import { Box, Button, Paper, Stack, Typography, Zoom, useMediaQuery, useTheme } from "@mui/material";
import { TreeViewDefaultItemModelProperties } from "@mui/x-tree-view";
import BulkDownloadModal from "./BulkDownloadModal";
import { Download } from "@mui/icons-material";
import { useState } from "react";
import { formatBytes } from "@/common/downloads";


type BulkDownloadChipProps = {
    visible: boolean;
    filePaths: string[];
    totalSize: number;
    numFiles: number;
    onClear: () => void;
    filterSummary?: string | null;
    ome?: string;
    fileTreeItems?: TreeViewDefaultItemModelProperties[];
};

const BulkDownloadChip = ({
    visible,
    filePaths,
    totalSize,
    filterSummary,
    ome,
    fileTreeItems,
    numFiles,
    onClear,

}: BulkDownloadChipProps) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    const numDatasets = new Set(
        filePaths
            .map((path) => path.split("/")[1])
            .filter(Boolean)
    ).size;

    return (
        <>
            <Zoom
                in={visible}
                mountOnEnter
                unmountOnExit
                timeout={{ enter: 320, exit: 220 }}
                style={{ transformOrigin: "center center" }}
            >
                <Box
                    sx={{
                        position: "fixed",
                        left: 0,
                        right: 0,
                        bottom: { xs: 16, md: 24 },
                        zIndex: (theme) => theme.zIndex.appBar + 2,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: "min(calc(100vw - 24px), 700px)",
                            mx: "auto",
                            px: { xs: 1, sm: 2.5 },
                            py: { xs: 0.75, sm: 1.5 },
                            borderRadius: 999,
                            border: "1px solid rgba(12, 64, 60, 0.12)",
                            boxShadow: "0 10px 30px rgba(16, 24, 40, 0.18)",
                        }}
                    >
                        <Stack
                            direction={"row"}
                            spacing={{ xs: .75, sm: 2 }}
                            alignItems={"center"}
                            justifyContent="space-between"
                        >
                            <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} alignItems="center" minWidth={0}>
                                <Box
                                    sx={{
                                        width: { xs: 28, sm: 36 },
                                        height: { xs: 28, sm: 36 },
                                        borderRadius: "50%",
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: "#e0f2f0",
                                        color: "primary.main",
                                        fontWeight: 700,
                                        fontSize: { xs: "0.8rem", sm: "1rem" },
                                        flexShrink: 0,
                                    }}
                                >
                                    {numDatasets}
                                </Box>
                                <Box minWidth={0}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontSize: { xs: "0.82rem", sm: "1rem" },
                                            fontWeight: 600,
                                        }}
                                    >
                                        {numDatasets} dataset{numDatasets === 1 ? "" : "s"} selected
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: "0.68rem", sm: "0.875rem" },
                                            color: "text.secondary",
                                        }}
                                    >
                                        {numFiles} file{numFiles === 1 ? "" : "s"} · {formatBytes(totalSize)}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 0.5, sm: 1 }}
                                alignItems="center"
                                justifyContent="flex-end"
                                flexShrink={0}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={onClear}
                                    size={isXs ? "small" : "medium"}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                    onClick={() => setOpen(true)}
                                    size={isXs ? "small" : "medium"}
                                >
                                    Bulk Download {isXs ? "" : `(${numFiles})`}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>
            </Zoom>
            <BulkDownloadModal
                open={open}
                onClose={() => setOpen(false)}
                filePaths={filePaths}
                totalSize={totalSize}
                ome={ome}
                fileTreeItems={fileTreeItems}
            />
        </>
    );
};

export default BulkDownloadChip;
