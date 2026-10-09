import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAnalyzeMatch, useMatchResult } from "../hooks/useMatch";
import { useSkills } from "../hooks/useSkills";
import { getErrorMessage } from "../utils/errors";

const MAX_LENGTH = 20000;

const scoreColor = (score) =>
  score >= 70 ? "success" : score >= 40 ? "warning" : "error";

function ScoreRing({ score }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={96}
        thickness={4}
        sx={{ color: "rgba(255,255,255,0.08)", position: "absolute" }}
      />
      <CircularProgress
        variant="determinate"
        value={score}
        size={96}
        thickness={4}
        color={scoreColor(score)}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography variant="h5">{Math.round(score)}%</Typography>
      </Box>
    </Box>
  );
}

function KeywordGroup({ title, keywords, color, emptyText }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: "0.12em" }}
      >
        {title} ({keywords.length})
      </Typography>
      {keywords.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
          {keywords.map((k) => (
            <Chip key={k} label={k} color={color} variant="outlined" />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function MatchPanel({ applicationId }) {
  const [jdText, setJdText] = useState("");
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useMatchResult(applicationId);
  const { data: skills = [], isSuccess: skillsLoaded } = useSkills();
  const analyze = useAnalyzeMatch();

  const tooLong = jdText.length > MAX_LENGTH;
  const canSubmit = jdText.trim().length > 0 && !tooLong && !analyze.isPending;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="overline"
        sx={{
          color: "primary.light",
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        Job description match
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        How well do your skills fit this role?
      </Typography>

      {skillsLoaded && skills.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You haven't added any skills yet, so every keyword will count as
          missing.{" "}
          <Link component={RouterLink} to="/skills">
            Add your skills
          </Link>{" "}
          first.
        </Alert>
      )}

      <TextField
        label="Paste the job description"
        multiline
        minRows={8}
        maxRows={16}
        fullWidth
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        error={tooLong}
        helperText={`${jdText.length.toLocaleString()} / ${MAX_LENGTH.toLocaleString()}`}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        disabled={!canSubmit}
        onClick={() => analyze.mutate({ id: applicationId, jdText })}
      >
        {analyze.isPending ? "Analyzing..." : result ? "Re-analyze" : "Analyze"}
      </Button>

      {analyze.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {getErrorMessage(analyze.error)}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      )}
      {isLoading && (
        <CircularProgress size={24} sx={{ mt: 3, display: "block" }} />
      )}

      {result && (
        <Box
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          {result.extractedKeywords.length === 0 ? (
            <Alert severity="info">
              No known technology keywords were found in this job description.
            </Alert>
          ) : (
            <>
              <Stack direction="row" spacing={3} alignItems="center">
                <ScoreRing score={result.matchScore} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {result.matchedKeywords.length} of{" "}
                    {result.extractedKeywords.length} keywords matched
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on your skills when you last ran the analysis.
                    Re-analyze after adding skills.
                  </Typography>
                </Box>
              </Stack>
              <KeywordGroup
                title="You have"
                keywords={result.matchedKeywords}
                color="success"
                emptyText="None of the required keywords are in your skill list yet."
              />
              <KeywordGroup
                title="Missing"
                keywords={result.missingKeywords}
                color="error"
                emptyText="Nothing missing. You cover every keyword found."
              />
            </>
          )}
        </Box>
      )}
    </Paper>
  );
}
