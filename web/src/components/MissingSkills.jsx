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

// Red = asked for by most of the jobs, amber = about half, blue = occasional
const barColor = (share) =>
  share >= 0.75 ? "error" : share >= 0.4 ? "warning" : "info";

function SkillRow({ skill, total }) {
  const share = total > 0 ? skill.count / total : 0;
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 2,
          mb: 0.5,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          sx={{ minWidth: 0 }}
        >
          {skill.keyword}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Asked in {skill.count} of {total} job{total === 1 ? "" : "s"}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={share * 100}
        color={barColor(share)}
        aria-label={`${skill.keyword}: asked in ${skill.count} of ${total} jobs`}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}

function ResumeCard({ resume }) {
  const total = resume.applicationsAnalyzed;
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
          {resume.resumeName}
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          label={`${total} job${total === 1 ? "" : "s"} analyzed`}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      {resume.skills.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No missing skills found for this resume.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {resume.skills.map((s) => (
            <SkillRow key={s.keyword} skill={s} total={total} />
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
      sx={{ p: 3, borderRadius: 4, display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h6" fontWeight={700}>
        Skills Gap by Resume
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Skills that the jobs you applied to asked for but this resume doesn't
        list yet. The ones at the top come up most often.
      </Typography>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      ) : error ? (
        <Alert severity="error">
          Couldn't load your skills gap. Try again.
        </Alert>
      ) : resumes.length === 0 ? (
        <Typography color="text.secondary">
          No skill gaps yet. They appear here once the job descriptions of your
          applications have been analyzed against a resume.
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 480, // scrolls inside the card when you add more resumes
            overflowY: "auto",
            pr: 1,
            scrollbarGutter: "stable",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 3,
            },
          }}
        >
          <Stack spacing={2}>
            {resumes.map((r) => (
              <ResumeCard key={r.resumeId} resume={r} />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
