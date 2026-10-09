import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import { STATUSES, STATUS_COLOR } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";

const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{getErrorMessage(error)}</Alert>;

  const maxMissing = Math.max(
    1,
    ...data.topMissingKeywords.map((k) => k.count),
  );

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" />

      {data.totalApplications === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nothing to show yet.{" "}
          <Link component={RouterLink} to="/applications">
            Add your first application
          </Link>
          .
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          mb: 4,
        }}
      >
        <StatCard label="Total" value={data.totalApplications} />
        {STATUSES.map((s) => (
          <StatCard
            key={s}
            label={label(s)}
            value={data.byStatus[s] ?? 0}
            color={STATUS_COLOR[s]}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Response rate by resume version</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A response means the application reached Screening, Interview or
            Offer.
          </Typography>
          {data.resumeStats.length === 0 ? (
            <Typography color="text.secondary">No data yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Resume</TableCell>
                  <TableCell align="right">Applied</TableCell>
                  <TableCell align="right">Responses</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.resumeStats.map((r) => (
                  <TableRow key={r.resumeVersion}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {r.resumeVersion}
                    </TableCell>
                    <TableCell align="right">{r.total}</TableCell>
                    <TableCell align="right">{r.responded}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LinearProgress
                          variant="determinate"
                          value={r.responseRate}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 44 }}>
                          {r.responseRate}%
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Top missing keywords</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Skills your analysed job descriptions ask for that you haven't
            listed.
          </Typography>
          {data.topMissingKeywords.length === 0 ? (
            <Typography color="text.secondary">
              Analyse a job description to see gaps here.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {data.topMissingKeywords.map((k) => (
                <Box key={k.keyword}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {k.keyword}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {k.count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    color="error"
                    value={(k.count / maxMissing) * 100}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </>
  );
}
