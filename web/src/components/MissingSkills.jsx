import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

// Red = frequently requested, amber = moderately requested, blue = occasional
const barColor = (share) =>
  share >= 0.75 ? "error" : share >= 0.4 ? "warning" : "info";

function SkillRow({ skill, total }) {
  const share = total > 0 ? skill.count / total : 0;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "baseline" }}
        spacing={{ xs: 0.25, sm: 1 }}
        sx={{ mb: 0.75 }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            minWidth: 0,
            maxWidth: "100%",
            overflowWrap: "anywhere",
          }}
        >
          {skill.keyword}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            flexShrink: 0,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          Asked in {skill.count} of {total} job
          {total === 1 ? "" : "s"}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, share * 100))}
        color={barColor(share)}
        aria-label={`${skill.keyword}: asked in ${skill.count} of ${total} jobs`}
        sx={{
          height: 7,
          borderRadius: 4,
        }}
      />
    </Box>
  );
}

function ResumeCard({ resume }) {
  const total = resume.applicationsAnalyzed;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2, minWidth: 0 }}
      >
        <Typography
          fontWeight={600}
          sx={{
            minWidth: 0,
            maxWidth: "100%",
            overflowWrap: "anywhere",
          }}
        >
          {resume.resumeName}
        </Typography>

        <Chip
          size="small"
          variant="outlined"
          label={`${total} job${total === 1 ? "" : "s"} analyzed`}
          sx={{
            maxWidth: "100%",
            flexShrink: 0,
            "& .MuiChip-label": {
              whiteSpace: "normal",
            },
          }}
        />
      </Stack>

      {resume.skills.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No missing skills found for this resume.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {resume.skills.map((skill) => (
            <SkillRow key={skill.keyword} skill={skill} total={total} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default function MissingSkills({ data, isLoading, error }) {
  const resumes = data ?? [];

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: { xs: 2.5, sm: 3 },
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          lineHeight: 1.4,
        }}
      >
        Skills Gap by Resume
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 1,
          mb: 2.5,
          lineHeight: 1.65,
        }}
      >
        Skills that the jobs you applied to asked for but this resume doesn't
        list yet. The ones at the top come up most often.
      </Typography>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      ) : error ? (
        <Alert severity="error" sx={{ minWidth: 0 }}>
          Couldn't load your skills gap. Try again.
        </Alert>
      ) : resumes.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          No skill gaps yet. They appear here once the job descriptions of your
          applications have been analyzed against a resume.
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: { xs: 400, sm: 480 },
            overflowY: "auto",
            overflowX: "hidden",
            minWidth: 0,
            pr: { xs: 0.5, sm: 1 },
            scrollbarGutter: "stable",
            overscrollBehavior: "contain",
            "&::-webkit-scrollbar": {
              width: { xs: 4, sm: 6 },
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "action.disabledBackground",
              borderRadius: 3,
            },
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0 }}>
            {resumes.map((resume) => (
              <ResumeCard key={resume.resumeId} resume={resume} />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
