import {
  Badge,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BulkDownloadModal from "./BulkDownloadModal";
import { Close, Download, Start, Tune } from "@mui/icons-material";
import { useState } from "react";
import { formatBytes } from "@/common/downloads";
import type { BulkDownloadDatasetItem } from "@/common/hooks/useOmeDownloadsState";

type BulkDownloadChipProps = {
  visible: boolean;
  filePaths: string[];
  totalSize: number;
  numFiles: number;
  onClear: () => void;
  ome?: string;
  bulkDownloadItems: BulkDownloadDatasetItem[];
  onRemoveFile: (sampleId: string, filename: string) => void;
  onRemoveDataset: (sampleId: string) => void;
};

const BulkDownloadChip = ({
  visible,
  filePaths,
  totalSize,
  ome,
  bulkDownloadItems,
  numFiles,
  onClear,
  onRemoveFile,
  onRemoveDataset,
}: BulkDownloadChipProps) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const numDatasets = bulkDownloadItems.length;

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
            bottom: 16,
            zIndex: (theme) => theme.zIndex.appBar + 2,
            pointerEvents: "none",
            pl: 1.5,
            pr: { xs: 10, sm: 1.5 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "fit-content",
              maxWidth: "min(100%, 700px)",
              mx: "auto",
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.75, sm: 1.5 },
              borderRadius: 999,
              border: "1px solid rgba(12, 64, 60, 0.12)",
              boxShadow: "0 10px 30px rgba(16, 24, 40, 0.18)",
              pointerEvents: "auto",
            }}
          >
            {/* One row at every width. It's under ~450px even with full labels,
                so it never needs to stack — below sm the labels just collapse to
                icon buttons to reclaim horizontal room. */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Summary: dataset count + total size. The file count lives on the
                  download action instead of being repeated here. */}
              <Stack direction="row" spacing={0.75} alignItems="baseline" minWidth={0}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {numDatasets} dataset{numDatasets === 1 ? "" : "s"} · {numFiles} file{numFiles === 1 ? "" : "s"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                {isXs ? (
                  <>
                    <Tooltip title="Clear" arrow>
                      <IconButton
                        onClick={onClear}
                        aria-label="Clear selection"
                        size="small"
                        sx={{
                          border: "1px solid",
                          borderColor: "rgba(0, 61, 56, 0.45)",
                          color: "primary.main",
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={`Download ${numFiles} file${numFiles === 1 ? "" : "s"}`}
                      arrow
                    >
                      <IconButton
                        onClick={() => setOpen(true)}
                        aria-label={`Download ${numFiles} file${numFiles === 1 ? "" : "s"}`}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <Badge
                          badgeContent={numFiles}
                          color="secondary"
                          overlap="rectangular"
                          sx={{ "& .MuiBadge-badge": { top: 0, right: -4 } }}
                        >
                          <Download fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={onClear}
                      sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<Tune />}
                      onClick={() => setOpen(true)}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Configure Download ({formatBytes(totalSize)})
                    </Button>
                  </>
                )}
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
        bulkDownloadItems={bulkDownloadItems}
        onRemoveFile={onRemoveFile}
        onRemoveDataset={onRemoveDataset}
      />
    </>
  );
};

export default BulkDownloadChip;
