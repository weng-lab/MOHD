"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Result } from "@weng-lab/ui-components";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type SearchResultDialogProps = {
  open: boolean;
  result: Result | null;
  onClose: () => void;
  onOpenInScreen: () => void;
  /** Offered only when the result can be shown in MOHD's own genome browser. */
  onOpenInGenomeBrowser?: () => void;
};

/** Where a header search result goes next: always SCREEN, and for some results the genome browser too. */
export default function SearchResultDialog({
  open,
  result,
  onClose,
  onOpenInScreen,
  onOpenInGenomeBrowser,
}: SearchResultDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          background: "#e1edec",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent={"space-between"}>
          <Typography sx={{ fontWeight: 700 }}>
            {onOpenInGenomeBrowser ? `Open ${result?.type}` : "Continue to SCREEN"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {result?.title && (
          <Box
            sx={{
              p: 1,
              my: 1,
              borderRadius: 2,
              bgcolor: "surface.light",
              border: "1px solid #e1edec",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Selected {result.type}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {result?.title}
            </Typography>
          </Box>
        )}
        <DialogContentText>
          {onOpenInGenomeBrowser
            ? `View this ${result?.type} in the MOHD genome browser, or open it in SCREEN in a new tab and continue exploring there.`
            : `This ${result?.type} is available in SCREEN. Would you like to open it in a new tab and continue exploring there?`}
        </DialogContentText>
      </DialogContent>
      {/* Gap rather than MUI's sibling margins, which misalign buttons that wrap on a phone. */}
      <DialogActions disableSpacing sx={{ px: 3, pb: 2.5, pt: 0, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Stay Here
        </Button>
        {onOpenInGenomeBrowser && (
          <Button onClick={onOpenInGenomeBrowser} variant="contained">
            Open In Genome Browser
          </Button>
        )}
        <Button
          onClick={onOpenInScreen}
          variant={onOpenInGenomeBrowser ? "outlined" : "contained"}
          endIcon={<OpenInNewIcon />}
        >
          Open In SCREEN
        </Button>
      </DialogActions>
    </Dialog>
  );
}
