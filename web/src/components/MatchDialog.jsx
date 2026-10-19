import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useAnalyzeJd } from "../hooks/useMatch";
import { getErrorMessage } from "../utils/errors";

const MAX_LENGTH = 20000;

function KeywordGroup({ title, items, color }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        {title} ({items.length})
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          None
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ minWidth: 0 }}>
          {items.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              size="small"
              color={color}
              variant="outlined"
              sx={{
                maxWidth: "100%",
                height: "auto",
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  py: 0.5,
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function MatchDialog({ application, onClose }) {
  const [jdText, setJdText] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mutation = useAnalyzeJd();
  const result = mutation.data;
  const usedResume = Boolean(result?.basis?.startsWith("Resume:"));

  const submit = () => {
    mutation.mutate({
      id: application.id,
      jdText: jdText.trim(),
    });
  };

  return (
    <Dialog
      open
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Match job description
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            overflowWrap: "anywhere",
            lineHeight: 1.6,
          }}
        >
          {application.role} at {application.company}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          minWidth: 0,
        }}
      >
        <Stack spacing={2.5} sx={{ pt: 0.5, minWidth: 0 }}>
          <TextField
            label="Paste the job description"
            placeholder="Paste the complete job description here..."
            multiline
            minRows={6}
            maxRows={14}
            fullWidth
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: MAX_LENGTH,
                "aria-label": "Job description text",
              },
            }}
            helperText={`${jdText.length.toLocaleString()}/${MAX_LENGTH.toLocaleString()} characters`}
            disabled={mutation.isPending}
            sx={{
              "& .MuiInputBase-root": {
                alignItems: "flex-start",
              },
              "& textarea": {
                overflowWrap: "anywhere",
              },
            }}
          />

          {mutation.isError && (
            <Alert severity="error" sx={{ overflowWrap: "anywhere" }}>
              {getErrorMessage(mutation.error)}
            </Alert>
          )}

          {result && (
            <Stack
              spacing={2.5}
              sx={{
                minWidth: 0,
                borderTop: 1,
                borderColor: "divider",
                pt: 2.5,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1.15rem", sm: "1.25rem" } }}
                >
                  Match score: {result.score}%
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                >
                  Compared against: {result.basis}
                </Typography>
              </Box>

              {!usedResume && (
                <Alert
                  severity="warning"
                  sx={{
                    "& .MuiAlert-message": {
                      minWidth: 0,
                      overflowWrap: "anywhere",
                    },
                  }}
                >
                  This analysis wasn't made against a resume, so it won't appear
                  in "Skills to Improve Your Resume". Link a resume that has
                  detected skills to this application, then run the match again.
                </Alert>
              )}

              <KeywordGroup
                title="Matched"
                items={result.matchedKeywords ?? []}
                color="success"
              />

              <KeywordGroup
                title="Missing"
                items={result.missingKeywords ?? []}
                color="error"
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          gap: 1,
          borderTop: 1,
          borderColor: "divider",
          flexDirection: { xs: "column-reverse", sm: "row" },
          "& > button": {
            minHeight: 44,
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: 100 },
          },
        }}
      >
        <Button
          color="inherit"
          onClick={onClose}
          disabled={mutation.isPending}
          fullWidth={isMobile}
        >
          Close
        </Button>

        <Button
          variant="contained"
          onClick={submit}
          disabled={!jdText.trim() || mutation.isPending}
          fullWidth={isMobile}
        >
          {mutation.isPending
            ? "Analyzing…"
            : result
              ? "Re-run analysis"
              : "Analyze"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
