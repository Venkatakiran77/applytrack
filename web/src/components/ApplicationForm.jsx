import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useResumes } from "../hooks/useResumes";

const today = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

export default function ApplicationForm({
  initial,
  saving,
  error,
  onSubmit,
  onClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [values, setValues] = useState({
    company: initial?.company ?? "",
    role: initial?.role ?? "",
    jobUrl: initial?.jobUrl ?? "",
    resumeId: initial?.resumeId ?? "",
    appliedOn: initial?.appliedOn ?? today(),
    notes: initial?.notes ?? "",
  });

  const { data: resumes = [], isLoading: resumesLoading } = useResumes();
  const [touched, setTouched] = useState(false);

  const set = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const errors = {
    company: values.company.trim() ? "" : "Company is required",
    role: values.role.trim() ? "" : "Role is required",
    jobUrl:
      !values.jobUrl.trim() || /^https?:\/\//i.test(values.jobUrl.trim())
        ? ""
        : "Must start with http:// or https://",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (hasErrors) return;

    onSubmit({
      company: values.company.trim(),
      role: values.role.trim(),
      jobUrl: values.jobUrl.trim() || null,
      resumeId: values.resumeId === "" ? null : values.resumeId,
      appliedOn: values.appliedOn || null,
      notes: values.notes.trim() || null,
    });
  };

  const show = (field) => touched && Boolean(errors[field]);

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", sm: 600 },
            m: { xs: 0, sm: 2 },
            maxHeight: {
              xs: "100%",
              sm: "calc(100% - 64px)",
            },
            height: { xs: "100%", sm: "auto" },
            minHeight: { xs: 0, sm: 300 },
            borderRadius: { xs: 0, sm: 3 },
            bgcolor: "background.paper",
            backgroundImage: "none",
            color: "text.primary",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogTitle
          sx={{
            flexShrink: 0,
            px: { xs: 2, sm: 3 },
            py: 2,
            fontSize: "1.2rem",
            fontWeight: 700,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {initial ? "Edit application" : "Add application"}
        </DialogTitle>

        <DialogContent
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            px: { xs: 2, sm: 3 },
            py: 2.5,
            bgcolor: "background.paper",
            boxSizing: "border-box",
          }}
        >
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" sx={{ overflowWrap: "anywhere" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Company"
              required
              autoFocus={!isMobile}
              fullWidth
              value={values.company}
              onChange={set("company")}
              error={show("company")}
              helperText={show("company") ? errors.company : " "}
            />

            <TextField
              label="Role"
              required
              fullWidth
              value={values.role}
              onChange={set("role")}
              error={show("role")}
              helperText={show("role") ? errors.role : " "}
            />

            <TextField
              label="Job URL"
              fullWidth
              type="url"
              value={values.jobUrl}
              onChange={set("jobUrl")}
              error={show("jobUrl")}
              helperText={show("jobUrl") ? errors.jobUrl : " "}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                minWidth: 0,
                "& > *": { minWidth: 0, flex: "1 1 0" },
              }}
            >
              <TextField
                select
                label="Resume"
                fullWidth
                value={values.resumeId}
                onChange={set("resumeId")}
                disabled={resumesLoading || resumes.length === 0}
                helperText={
                  resumesLoading
                    ? "Loading resumes..."
                    : resumes.length === 0
                      ? "Upload a resume in the Resumes tab first"
                      : " "
                }
              >
                {resumes.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Applied on"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={values.appliedOn}
                onChange={set("appliedOn")}
              />
            </Stack>

            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              value={values.notes}
              onChange={set("notes")}
              placeholder="Add interview details, follow-ups, or other notes..."
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            flexShrink: 0,
            px: { xs: 2, sm: 3 },
            py: 2,
            gap: 1,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            flexDirection: { xs: "column-reverse", sm: "row" },
            "& > button": {
              minHeight: 44,
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 100 },
            },
          }}
        >
          <Button
            color="inherit"
            onClick={onClose}
            disabled={saving}
            fullWidth={isMobile}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            fullWidth={isMobile}
          >
            {saving ? "Saving..." : "Save application"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
