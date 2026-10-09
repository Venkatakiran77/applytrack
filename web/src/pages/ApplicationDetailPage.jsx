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
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {label}
      </Typography>
      <Typography component="div" sx={{ mt: 0.25, wordBreak: "break-word" }}>
        {children ?? "-"}
      </Typography>
    </Box>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { data: app, isLoading, isError, error } = useApplication(id);
  const updateMutation = useUpdateApplication();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <CircularProgress />;

  if (isError) {
    const notFound = error.response?.status === 404;
    return (
      <>
        <Alert severity={notFound ? "warning" : "error"} sx={{ mb: 2 }}>
          {notFound
            ? "This application does not exist."
            : getErrorMessage(error)}
        </Alert>
        <Button
          component={RouterLink}
          to="/applications"
          startIcon={<ArrowBack />}
        >
          Back to applications
        </Button>
      </>
    );
  }

  const safeUrl =
    app.jobUrl && /^https?:\/\//i.test(app.jobUrl) ? app.jobUrl : null;

  const handleSubmit = (values) =>
    updateMutation.mutate(
      { id: app.id, ...values },
      {
        onSuccess: () => {
          setEditing(false);
          updateMutation.reset();
        },
      },
    );

  return (
    <>
      <Button
        component={RouterLink}
        to="/applications"
        startIcon={<ArrowBack />}
        color="inherit"
        sx={{ mb: 2, color: "text.secondary" }}
      >
        All applications
      </Button>

      <PageHeader
        eyebrow={app.company}
        title={app.role}
        action={
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        }
      />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.6fr" },
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
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
              <Link href={safeUrl} target="_blank" rel="noopener noreferrer">
                Open posting
              </Link>
            ) : null}
          </Detail>
          <Detail label="Resume version">{app.resumeVersion}</Detail>
          <Detail label="Applied on">{app.appliedOn}</Detail>
          <Detail label="Last updated">
            {new Date(app.lastUpdated).toLocaleString()}
          </Detail>
          <Detail label="Notes">
            <span style={{ whiteSpace: "pre-wrap" }}>{app.notes}</span>
          </Detail>
        </Paper>

        <MatchPanel applicationId={app.id} />
      </Box>

      {editing && (
        <ApplicationForm
          initial={app}
          saving={updateMutation.isPending}
          error={
            updateMutation.isError ? getErrorMessage(updateMutation.error) : ""
          }
          onSubmit={handleSubmit}
          onClose={() => {
            setEditing(false);
            updateMutation.reset();
          }}
        />
      )}
    </>
  );
}
