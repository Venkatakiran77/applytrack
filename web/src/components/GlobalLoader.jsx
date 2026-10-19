// components/GlobalLoader.jsx
import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Alert, LinearProgress, Snackbar } from "@mui/material";

export default function GlobalLoader() {
  const busy = useIsFetching() + useIsMutating() > 0;
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [busy]);

  return (
    <>
      {busy && (
        <LinearProgress
          sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000 }}
        />
      )}
      <Snackbar
        open={slow}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled">
          Server is waking up (free hosting). The first request can take up to 2
          minutes…
        </Alert>
      </Snackbar>
    </>
  );
}
