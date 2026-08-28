"use client";

import { Alert, AlertTitle, Box, Button } from "@mui/material";

// Error boundaries must be client components.
const Error = ({ error, reset }: { error: Error; reset: () => void }) => (
  <Box p={3}>
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={reset}>
          Retry
        </Button>
      }
    >
      <AlertTitle>Failed to load WGS PCA data</AlertTitle>
      {error.message}
    </Alert>
  </Box>
);

export default Error;
