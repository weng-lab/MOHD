import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import type { BulkDownloadDatasetItem } from "@/common/hooks/useOmeDownloadsState";

export type SelectedFilesReviewProps = {
  items: BulkDownloadDatasetItem[];
  /** Removals write straight back to the table selection — this list owns no copy. */
  onRemoveFile: (sampleId: string, filename: string) => void;
  onRemoveDataset: (sampleId: string) => void;
};

/**
 * The scrollable review list inside the bulk download modal: one collapsible
 * section per dataset, listing the files a job would fetch. Which sections are
 * open is local state — nothing above the list reads it, and the modal
 * unmounting on close is what resets it.
 */
export default function SelectedFilesReview({
  items,
  onRemoveFile,
  onRemoveDataset,
}: SelectedFilesReviewProps) {
  // A Set rather than an array: this is looked up once per dataset per render.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const handleRemoveDataset = (dataset: BulkDownloadDatasetItem) => {
    setExpandedIds((current) => {
      if (!current.has(dataset.id)) return current;
      const next = new Set(current);
      next.delete(dataset.id);
      return next;
    });
    onRemoveDataset(dataset.sampleId);
  };

  return (
    <Stack>
      {items.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No files selected. Close this dialog and pick files from the table to
          start a download.
        </Typography>
      )}
      {items.map((dataset, i) => {
        const isExpanded = expandedIds.has(dataset.id);

        return (
          <Box key={dataset.id}>
            <Accordion
              expanded={isExpanded}
              onChange={() => toggleExpanded(dataset.id)}
              disableGutters
              elevation={0}
              square
              sx={{
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  p: 2,
                  flexDirection: "row-reverse",
                  bgcolor: isExpanded ? "surface.light" : "transparent",
                  "& .MuiAccordionSummary-content": {
                    my: 0,
                    ml: 1,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      <b>{dataset.sampleId}</b>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {dataset.children.length} file
                      {dataset.children.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <IconButton
                    component="span"
                    role="button"
                    aria-label="Remove dataset"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveDataset(dataset);
                    }}
                  >
                    <DeleteOutlineIcon sx={{ color: "text.secondary" }} />
                  </IconButton>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack>
                  {dataset.children.map((child) => (
                    <Stack
                      key={dataset.id + "-" + child.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{
                        pl: 2,
                        py: 1,
                      }}
                    >
                      <Typography variant="body1">{child.label}</Typography>
                      <IconButton
                        aria-label={`Remove ${child.label}`}
                        size="small"
                        onClick={() => onRemoveFile(dataset.sampleId, child.id)}
                      >
                        <RemoveIcon sx={{ color: "text.secondary" }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
            {i !== items.length - 1 && <Divider />}
          </Box>
        );
      })}
    </Stack>
  );
}
