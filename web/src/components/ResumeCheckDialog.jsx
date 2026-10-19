import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { checkResume } from "../api/resumeCheck";
import { getErrorMessage } from "../utils/errors";

const MAX_LENGTH = 20000;
const storageKey = (id) => `resume-check:${id}`;

function load(id) {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(id))) ?? null;
  } catch {
    return null;
  }
}

function save(id, value) {
  try {
    sessionStorage.setItem(storageKey(id), JSON.stringify(value));
  } catch {
    // The result remains available while the dialog is open.
  }
}

function KeywordGroup({ title, items, color }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
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

export default function ResumeCheckDialog({ resume, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const stored = load(resume.id);
  const [jdText, setJdText] = useState(stored?.jdText ?? "");
  const [result, setResult] = useState(stored?.result ?? null);

  const mutation = useMutation({
    mutationFn: (text) => checkResume(resume.id, text),
    onSuccess: (data, text) => {
      setResult(data);
      save(resume.id, { jdText: text, result: data });
    },
  });

  const submit = () => mutation.mutate(jdText.trim());

  const canSubmit =
    jdText.trim().length > 0 &&
    jdText.length <= MAX_LENGTH &&
    !mutation.isPending;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2.5, sm: 3 },
          pb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.15rem", sm: "1.25rem" },
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          Check resume against a job description
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, overflowWrap: "anywhere" }}
        >
          {resume.name}
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <TextField
            label="Paste the job description"
            placeholder="Paste the complete job description here..."
            multiline
            minRows={isMobile ? 7 : 6}
            maxRows={isMobile ? 12 : 14}
            fullWidth
            value={jdText}
            onChange={(event) => setJdText(event.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: MAX_LENGTH,
                "aria-label": "Job description",
              },
            }}
            helperText={`${jdText.length.toLocaleString()} / ${MAX_LENGTH.toLocaleString()} characters`}
            disabled={mutation.isPending}
            sx={{
              "& .MuiInputBase-root": {
                alignItems: "flex-start",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              },
              "& .MuiFormHelperText-root": {
                mx: 0,
                mt: 1,
              },
            }}
          />

          {mutation.isError && (
            <Alert
              severity="error"
              sx={{
                overflowWrap: "anywhere",
                "& .MuiAlert-message": { minWidth: 0 },
              }}
            >
              {getErrorMessage(mutation.error)}
            </Alert>
          )}

          {result && (
            <Box
              sx={{
                minWidth: 0,
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 2.5,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  Resume compatibility
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,
                    fontWeight: 700,
                    fontSize: { xs: "1.75rem", sm: "2rem" },
                  }}
                >
                  {result.score}%
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, overflowWrap: "anywhere" }}
                >
                  {result.basis}
                </Typography>
              </Box>

              <Stack spacing={2.5}>
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
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: "stretch",
          "& > button": {
            width: { xs: "100%", sm: "auto" },
            minHeight: 44,
            m: "0 !important",
          },
        }}
      >
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>

        <Button variant="contained" onClick={submit} disabled={!canSubmit}>
          {mutation.isPending
            ? "Analyzing..."
            : result
              ? "Re-analyze"
              : "Analyze"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
