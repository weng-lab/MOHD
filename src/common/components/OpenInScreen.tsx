"use client";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Result } from "@weng-lab/ui-components";
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type OpenInScreenProps = {
  open: boolean;
  result: Result | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OpenInScreen({ open, result, onClose, onConfirm }: OpenInScreenProps) {
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
        <Stack direction="row" alignItems="center" justifyContent={"space-between"}>
          <Typography sx={{ fontWeight: 700 }}>
            Continue to SCREEN
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
          >
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
          This {result?.type} is available in SCREEN. Would you like to open it in a new tab and continue exploring there?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Stay Here
        </Button>
        <Button onClick={onConfirm} variant="contained" endIcon={<OpenInNewIcon />}>
          Open In SCREEN
        </Button>
      </DialogActions>
    </Dialog>
  );
}
