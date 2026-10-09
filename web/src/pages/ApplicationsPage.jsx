import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/PageHeader";
import ApplicationsTable from "../components/ApplicationsTable";
import ApplicationForm from "../components/ApplicationForm";
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplication,
  useUpdateStatus,
} from "../hooks/useApplications";
import { STATUSES } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";

export default function ApplicationsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState({ field: "appliedOn", direction: "desc" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null); // { severity, message }

  const { data, isLoading, isFetching, isError, error } = useApplications({
    page,
    size,
    status,
    sort: `${sort.field},${sort.direction}`,
  });
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const statusMutation = useUpdateStatus();
  const deleteMutation = useDeleteApplication();

  const rows = data?.content ?? [];
  // supports both the flat Page JSON and the newer { page: {...} } shape
  const total = data?.page?.totalElements ?? data?.totalElements ?? 0;

  // deleted the last row of the last page -> step back one page
  useEffect(() => {
    if (!isFetching && rows.length === 0 && page > 0) setPage((p) => p - 1);
  }, [isFetching, rows.length, page]);

  const notify = (severity, message) => setToast({ severity, message });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (app) => {
    setEditing(app);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleSubmit = (values) => {
    const mutation = editing ? updateMutation : createMutation;
    const payload = editing ? { id: editing.id, ...values } : values;
    mutation.mutate(payload, {
      onSuccess: () => {
        closeForm();
        notify(
          "success",
          editing ? "Application updated" : "Application added",
        );
      },
    });
  };

  const handleStatusChange = (id, newStatus) =>
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onError: (err) => notify("error", getErrorMessage(err)),
      },
    );

  const handleSort = (field) =>
    setSort((s) => ({
      field,
      direction: s.field === field && s.direction === "asc" ? "desc" : "asc",
    }));

  const confirmDelete = () =>
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        notify("success", "Application deleted");
      },
      onError: (err) => {
        setToDelete(null);
        notify("error", getErrorMessage(err));
      },
    });

  const activeMutation = editing ? updateMutation : createMutation;

  return (
    <>
      <PageHeader
        eyebrow="Your pipeline"
        title="Applications"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add application
          </Button>
        }
      />

      <Stack direction="row" sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          sx={{ minWidth: 180 }}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      )}

      <ApplicationsTable
        rows={rows}
        total={total}
        page={page}
        rowsPerPage={size}
        sort={sort}
        loading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setSize(n);
          setPage(0);
        }}
        onSortChange={handleSort}
        onStatusChange={handleStatusChange}
        onEdit={openEdit}
        onDelete={setToDelete}
      />

      {formOpen && (
        <ApplicationForm
          key={editing?.id ?? "new"}
          initial={editing}
          saving={activeMutation.isPending}
          error={
            activeMutation.isError ? getErrorMessage(activeMutation.error) : ""
          }
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete application?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete && `${toDelete.role} at ${toDelete.company}`} will be
            removed together with its saved job description analysis. This can't
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
