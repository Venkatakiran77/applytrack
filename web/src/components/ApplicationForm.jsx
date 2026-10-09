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
} from "@mui/material";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the local timezone

// Rendered only while open, so state resets each time via the parent's `key`.
export default function ApplicationForm({
  initial,
  saving,
  error,
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState({
    company: initial?.company ?? "",
    role: initial?.role ?? "",
    jobUrl: initial?.jobUrl ?? "",
    resumeVersion: initial?.resumeVersion ?? "",
    appliedOn: initial?.appliedOn ?? today(),
    notes: initial?.notes ?? "",
  });
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
      resumeVersion: values.resumeVersion.trim() || null,
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
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <DialogTitle>
        {initial ? "Edit application" : "Add application"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Company"
            required
            autoFocus
            value={values.company}
            onChange={set("company")}
            error={show("company")}
            helperText={show("company") ? errors.company : " "}
          />
          <TextField
            label="Role"
            required
            value={values.role}
            onChange={set("role")}
            error={show("role")}
            helperText={show("role") ? errors.role : " "}
          />
          <TextField
            label="Job URL"
            value={values.jobUrl}
            onChange={set("jobUrl")}
            error={show("jobUrl")}
            helperText={show("jobUrl") ? errors.jobUrl : " "}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Resume version"
              placeholder="v1"
              fullWidth
              value={values.resumeVersion}
              onChange={set("resumeVersion")}
            />
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
            multiline
            minRows={3}
            value={values.notes}
            onChange={set("notes")}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
