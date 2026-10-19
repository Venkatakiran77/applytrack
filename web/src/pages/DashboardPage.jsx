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
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import { STATUSES, STATUS_COLOR } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";
import MissingSkills from "../components/MissingSkills";

const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: { xs: 1, sm: 0 } }}>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader eyebrow="Overview" title="Dashboard" />

      {data.totalApplications === 0 && (
        <Alert
          severity="info"
          sx={{
            mb: { xs: 2, sm: 3 },
            alignItems: "flex-start",
            "& .MuiAlert-message": { minWidth: 0 },
          }}
        >
          Nothing to show yet.{" "}
          <Link component={RouterLink} to="/applications">
            Add your first application
          </Link>
          .
        </Alert>
      )}

      {/* Responsive application statistics */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.25, sm: 2 },
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          mb: { xs: 3, sm: 4 },
          "& > *": {
            minWidth: 0,
          },
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

      {/* Responsive dashboard content */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1.2fr) minmax(0, 1fr)",
          },
          alignItems: "start",
          minWidth: 0,
          "& > *": {
            minWidth: 0,
            maxWidth: "100%",
          },
        }}
      >
        <MissingSkills
          data={data.missingByResume}
          isLoading={isLoading}
          error={isError ? error : null}
        />

        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, sm: 3 },
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.05rem", sm: "1.25rem" },
              fontWeight: 600,
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            Response rate by resume version
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.6 }}
          >
            A response means the application reached Screening, Interview or
            Offer.
          </Typography>

          {data.resumeStats.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No data yet.
            </Typography>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <Table
                size="small"
                aria-label="Response rate by resume version"
                sx={{
                  minWidth: { xs: 420, sm: 480 },
                  "& th, & td": {
                    px: { xs: 1, sm: 1.5 },
                    py: 1.5,
                  },
                  "& th": {
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Resume</TableCell>
                    <TableCell align="right">Applied</TableCell>
                    <TableCell align="right">Responses</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Rate</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.resumeStats.map((r) => (
                    <TableRow
                      key={r.resumeVersion}
                      hover
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          maxWidth: 130,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {r.resumeVersion}
                      </TableCell>

                      <TableCell align="right">{r.total}</TableCell>

                      <TableCell align="right">{r.responded}</TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ minWidth: 110 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, r.responseRate))}
                            aria-label={`Response rate ${r.responseRate}%`}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              minWidth: 30,
                            }}
                          />

                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 42,
                              textAlign: "right",
                              fontWeight: 500,
                            }}
                          >
                            {r.responseRate}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
