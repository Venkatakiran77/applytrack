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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAnalyzeMatch, useMatchResult } from "../hooks/useMatch";
import { useSkills } from "../hooks/useSkills";
import { getErrorMessage } from "../utils/errors";

const MAX_LENGTH = 20000;

const scoreColor = (score) =>
  score >= 70 ? "success" : score >= 40 ? "warning" : "error";

function ScoreRing({ score }) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexShrink: 0,
      }}
      role="img"
      aria-label={`Match score: ${Math.round(score)} percent`}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={88}
        thickness={4}
        sx={{
          color: "action.hover",
          position: "absolute",
        }}
      />
      <CircularProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, score))}
        size={88}
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
        <Typography variant="h5" fontWeight={700}>
          {Math.round(score)}%
        </Typography>
      </Box>
    </Box>
  );
}

function KeywordGroup({ title, keywords, color, emptyText }) {
  return (
    <Box sx={{ mt: 3, minWidth: 0 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{
          letterSpacing: "0.1em",
          fontWeight: 700,
        }}
      >
        {title} ({keywords.length})
      </Typography>

      {keywords.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, overflowWrap: "anywhere" }}
        >
          {emptyText}
        </Typography>
      ) : (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 1, minWidth: 0 }}
        >
          {keywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              color={color}
              variant="outlined"
              sx={{
                maxWidth: "100%",
                height: "auto",
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  py: 0.75,
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function MatchPanel({ applicationId }) {
  const [jdText, setJdText] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, sm: 3 },
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "primary.light",
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        Job description match
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mb: 2,
          mt: 0.5,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          lineHeight: 1.4,
        }}
      >
        How well do your skills fit this role?
      </Typography>

      {skillsLoaded && skills.length === 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            alignItems: "flex-start",
            "& .MuiAlert-message": {
              minWidth: 0,
              overflowWrap: "anywhere",
            },
          }}
        >
          You haven't added any skills yet, so every keyword will count as
          missing.{" "}
          <Link component={RouterLink} to="/skills" underline="hover">
            Add your skills
          </Link>{" "}
          first.
        </Alert>
      )}

      <TextField
        label="Paste the job description"
        placeholder="Paste the complete job description here..."
        multiline
        minRows={6}
        maxRows={12}
        fullWidth
        value={jdText}
        onChange={(event) => setJdText(event.target.value)}
        error={tooLong}
        helperText={
          tooLong
            ? `Maximum ${MAX_LENGTH.toLocaleString()} characters allowed.`
            : `${jdText.length.toLocaleString()} / ${MAX_LENGTH.toLocaleString()} characters`
        }
        slotProps={{
          htmlInput: {
            "aria-label": "Job description",
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            alignItems: "flex-start",
            fontSize: { xs: "0.9rem", sm: "1rem" },
          },
          "& textarea": {
            overflowWrap: "anywhere",
          },
          "& .MuiFormHelperText-root": {
            mx: 0,
            mt: 1,
          },
        }}
      />

      <Button
        variant="contained"
        fullWidth={isMobile}
        size="large"
        disabled={!canSubmit}
        onClick={() =>
          analyze.mutate({
            id: applicationId,
            jdText: jdText.trim(),
          })
        }
        sx={{
          mt: 2,
          minHeight: 44,
          px: 3,
        }}
      >
        {analyze.isPending
          ? "Analyzing..."
          : result
            ? "Re-analyze"
            : "Analyze match"}
      </Button>

      {analyze.isError && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            overflowWrap: "anywhere",
          }}
        >
          {getErrorMessage(analyze.error)}
        </Alert>
      )}

      {isError && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            overflowWrap: "anywhere",
          }}
        >
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      {result && (
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            minWidth: 0,
          }}
        >
          {result.basis && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 2,
                overflowWrap: "anywhere",
              }}
            >
              Compared against: {result.basis}
            </Typography>
          )}

          {result.basis?.startsWith("Skills list") && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This application has no usable resume linked, so the manual skills
              list was used. Edit the application and choose a resume for a
              resume-based analysis.
            </Alert>
          )}

          {result.extractedKeywords.length === 0 ? (
            <Alert severity="info">
              No known technology keywords were found in this job description.
            </Alert>
          ) : (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 3 }}
                alignItems="center"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <ScoreRing score={result.matchScore} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {result.matchedKeywords.length} of{" "}
                    {result.extractedKeywords.length} keywords matched
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Based on your skills when you last ran the analysis.
                  </Typography>
                </Box>
              </Stack>

              <KeywordGroup
                title="You have"
                keywords={result.matchedKeywords}
                color="success"
                emptyText="None of the required keywords are in your linked source yet."
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
