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
    /* storage unavailable: the result simply lasts while the dialog is open */
  }
}

function KeywordGroup({ title, items, color }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {title} ({items.length})
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          None
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {items.map((k) => (
            <Chip
              key={k}
              label={k}
              size="small"
              color={color}
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function ResumeCheckDialog({ resume, onClose }) {
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

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Check resume against a job description
        <Typography variant="body2" color="text.secondary">
          {resume.name}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Paste the job description"
            multiline
            minRows={6}
            maxRows={14}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }} // MUI v5: inputProps={{ maxLength: MAX_LENGTH }}
            helperText={`${jdText.length}/${MAX_LENGTH}`}
            disabled={mutation.isPending}
          />

          {mutation.isError && (
            <Alert severity="error">{getErrorMessage(mutation.error)}</Alert>
          )}

          {result && (
            <Stack spacing={1.5}>
              <Typography variant="h6">Match score: {result.score}%</Typography>
              <Typography variant="body2" color="text.secondary">
                {result.basis}
              </Typography>
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

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!jdText.trim() || mutation.isPending}
        >
          {mutation.isPending
            ? "Analyzing…"
            : result
              ? "Re-analyze"
              : "Analyze"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
