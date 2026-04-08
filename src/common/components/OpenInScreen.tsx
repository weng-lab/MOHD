"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";

type OpenInScreenProps = {
  open: boolean;
  resultTitle: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OpenInScreen({ open, resultTitle, onClose, onConfirm }: OpenInScreenProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{
          background: "#e1edec",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Continue to SCREEN
        </Typography>
      </DialogTitle>
      <DialogContent>
        {resultTitle && (
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
              Selected result
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {resultTitle}
            </Typography>
          </Box>
        )}
        <DialogContentText>
          This result is available in SCREEN. Would you like to open it in a new tab and continue exploring there?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Stay Here
        </Button>
        <Button onClick={onConfirm} variant="contained">
          Open In SCREEN
        </Button>
      </DialogActions>
    </Dialog>
  );
}
