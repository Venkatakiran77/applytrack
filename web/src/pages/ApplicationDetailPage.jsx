import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/StatusChip";
import ApplicationForm from "../components/ApplicationForm";
import MatchPanel from "../components/MatchPanel";
import { useApplication, useUpdateApplication } from "../hooks/useApplications";
import { getErrorMessage } from "../utils/errors";

function Detail({ label, children }) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          mt: 0.5,
          minWidth: 0,
          overflowWrap: "anywhere",
          lineHeight: 1.6,
        }}
      >
        {children ?? "-"}
      </Box>
    </Box>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { data: app, isLoading, isError, error } = useApplication(id);
  const updateMutation = useUpdateApplication();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    const notFound = error?.response?.status === 404;

    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Alert severity={notFound ? "warning" : "error"} sx={{ mb: 2 }}>
          {notFound
            ? "This application does not exist."
            : getErrorMessage(error)}
        </Alert>

        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBack />}
          sx={{ maxWidth: "100%" }}
        >
          Back to applications
        </Button>
      </Box>
    );
  }

  if (!app) {
    return (
      <Alert severity="warning">Application details are unavailable.</Alert>
    );
  }

  const safeUrl =
    app.jobUrl && /^https?:\/\//i.test(app.jobUrl) ? app.jobUrl : null;

  const handleSubmit = (values) => {
    updateMutation.mutate(
      { id: app.id, ...values },
      {
        onSuccess: () => {
          setEditing(false);
          updateMutation.reset();
        },
      },
    );
  };

  const closeEdit = () => {
    setEditing(false);
    updateMutation.reset();
  };

  return (
    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ minWidth: 0 }}>
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBack />}
          color="inherit"
          size="small"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            color: "text.secondary",
            maxWidth: "100%",
          }}
        >
          All applications
        </Button>

        <Box sx={{ minWidth: 0 }}>
          <PageHeader
            eyebrow={app.company}
            title={app.role}
            action={
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<EditOutlined />}
                onClick={() => setEditing(true)}
                sx={{
                  minHeight: 40,
                  flexShrink: 0,
                  minWidth: { xs: "auto", sm: 100 },
                  maxWidth: "100%",
                }}
              >
                Edit
              </Button>
            }
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) minmax(0, 1.6fr)",
          },
          gap: { xs: 2, sm: 3 },
          alignItems: "start",
          width: "100%",
          minWidth: 0,
          "& > *": {
            minWidth: 0,
            maxWidth: "100%",
          },
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: 2, sm: 3 },
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            sx={{ mb: { xs: 2.5, sm: 3 }, minWidth: 0 }}
          >
            <StatusChip status={app.status} />

            {app.followUpNeeded && (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label="Follow up"
              />
            )}
          </Stack>

          <Detail label="Job posting">
            {safeUrl ? (
              <Link
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "inline-block", overflowWrap: "anywhere" }}
              >
                Open posting
              </Link>
            ) : (
              "-"
            )}
          </Detail>

          <Detail label="Resume version">{app.resumeVersion || "-"}</Detail>
          <Detail label="Applied on">{app.appliedOn || "-"}</Detail>

          <Detail label="Last updated">
            {app.lastUpdated ? new Date(app.lastUpdated).toLocaleString() : "-"}
          </Detail>

          <Detail label="Notes">
            <Typography
              component="div"
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                lineHeight: 1.6,
              }}
            >
              {app.notes || "-"}
            </Typography>
          </Detail>
        </Paper>

        <Box sx={{ minWidth: 0, width: "100%", overflow: "hidden" }}>
          <MatchPanel applicationId={app.id} />
        </Box>
      </Box>

      {editing && (
        <ApplicationForm
          initial={app}
          saving={updateMutation.isPending}
          error={
            updateMutation.isError ? getErrorMessage(updateMutation.error) : ""
          }
          onSubmit={handleSubmit}
          onClose={closeEdit}
        />
      )}
    </Stack>
  );
}
