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
} from "@mui/material";
import { useAnalyzeJd } from "../hooks/useMatch";
import { getErrorMessage } from "../utils/errors";

const MAX_LENGTH = 20000; // matches @Size(max = 20000) on MatchRequest

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

export default function MatchDialog({ application, onClose }) {
  const [jdText, setJdText] = useState("");
  const mutation = useAnalyzeJd();
  const result = mutation.data;
  const usedResume = Boolean(result?.basis?.startsWith("Resume:"));

  const submit = () =>
    mutation.mutate({ id: application.id, jdText: jdText.trim() });

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Match job description
        <Typography variant="body2" color="text.secondary">
          {application.role} at {application.company}
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
            slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
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
                Compared against: {result.basis}
              </Typography>
              {!usedResume && (
                <Alert severity="warning">
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

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!jdText.trim() || mutation.isPending}
        >
          {mutation.isPending ? "Analyzing…" : result ? "Re-run" : "Analyze"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
