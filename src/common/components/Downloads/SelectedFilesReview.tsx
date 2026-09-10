import { memo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Stack, Typography } from "@mui/material";
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

/*
 * Every sx below is hoisted to module scope, and every state-dependent style is
 * expressed as a CSS selector rather than a ternary. A selection can run to
 * thousands of datasets, and an sx object literal in the loop means one style
 * object built and serialized per row per render.
 */

const SECTION_SX = {
  // Collapsed rows still cost style, layout and paint at this count. `auto`
  // lets the browser skip all three for anything scrolled out of view, and
  // remember each row's last measured height so the scrollbar stays honest.
  contentVisibility: "auto",
  containIntrinsicSize: "auto 88px",
  // A border instead of a <Divider>: one less element and one less emotion
  // style per row, and no index comparison to find the last one.
  "&:not(:last-of-type)": { borderBottom: 1, borderColor: "divider" },
};

const ACCORDION_SX = { overflow: "hidden" };

const SUMMARY_SX = {
  p: 2,
  flexDirection: "row-reverse",
  // Was a ternary on the open flag; as a selector it stays part of one static
  // style object that MUI can hand straight to emotion.
  "&.Mui-expanded": { bgcolor: "surface.light" },
  "& .MuiAccordionSummary-content": { my: 0, ml: 1 },
};

// Collapsed sections keep their file rows out of the DOM entirely. This is what
// makes opening the modal on a large selection cheap: only the dataset headers
// mount, not every file under every dataset.
const ACCORDION_SLOT_PROPS = { transition: { unmountOnExit: true } };

const SUMMARY_ROW_SX = { width: "100%" };
const ICON_SX = { color: "text.secondary" };
const FILE_ROW_SX = { pl: 2, py: 1 };

type DatasetSectionProps = {
  dataset: BulkDownloadDatasetItem;
  onRemoveFile: (sampleId: string, filename: string) => void;
  onRemoveDataset: (sampleId: string) => void;
};

/**
 * One dataset's collapsible section.
 *
 * Open/closed is local state rather than a set held by the list, so expanding a
 * section re-renders that section alone instead of every section in the
 * selection. Nothing above needs to read it, and removing a dataset unmounts
 * the section, which discards the state with it.
 *
 * `memo` is what keeps a removal cheap: `buildBulkDownloadItems` hands back the
 * same `dataset` object for every dataset the removal didn't touch, so only the
 * changed section re-renders.
 */
const DatasetSection = memo(function DatasetSection({ dataset, onRemoveFile, onRemoveDataset }: DatasetSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={SECTION_SX}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded((open) => !open)}
        slotProps={ACCORDION_SLOT_PROPS}
        disableGutters
        elevation={0}
        square
        sx={ACCORDION_SX}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={SUMMARY_SX}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={SUMMARY_ROW_SX}>
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
                onRemoveDataset(dataset.sampleId);
              }}
            >
              <DeleteOutlineIcon sx={ICON_SX} />
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
                sx={FILE_ROW_SX}
              >
                <Typography variant="body1">{child.label}</Typography>
                <IconButton
                  aria-label={`Remove ${child.label}`}
                  size="small"
                  onClick={() => onRemoveFile(dataset.sampleId, child.id)}
                >
                  <RemoveIcon sx={ICON_SX} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
});

/**
 * The scrollable review list inside the bulk download modal: one collapsible
 * section per dataset, listing the files a job would fetch. The list itself
 * holds no state — each section owns whether it's open — so interacting with
 * one section costs one section's render regardless of how many are selected.
 */
export default function SelectedFilesReview({ items, onRemoveFile, onRemoveDataset }: SelectedFilesReviewProps) {
  return (
    <Stack>
      {items.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No files selected. Close this dialog and pick files from the table to start a download.
        </Typography>
      )}
      {items.map((dataset) => (
        <DatasetSection
          key={dataset.id}
          dataset={dataset}
          onRemoveFile={onRemoveFile}
          onRemoveDataset={onRemoveDataset}
        />
      ))}
    </Stack>
  );
}
