import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  useDeleteResume,
  useResumes,
  useUploadResume,
} from "../hooks/useResumes";
import { downloadResume } from "../api/resumesApi";
import ResumeCheckDialog from "../components/ResumeCheckDialog";

const Spinner = <CircularProgress size={16} color="inherit" />;

export default function ResumesPage() {
  const { data = [], isLoading, isError } = useResumes();
  const upload = useUploadResume();
  const remove = useDeleteResume();
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toCheck, setToCheck] = useState(null);

  const submit = () =>
    upload.mutate(
      { name, file },
      {
        onSuccess: () => {
          setName("");
          setFile(null);
        },
      },
    );

  const handleDownload = async (r) => {
    setDownloadingId(r.id);
    try {
      await downloadResume(r);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Resumes</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Version name (e.g. V1, FE, BE)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 60 }}
            size="small"
          />
          <Button component="label" variant="outlined">
            {file ? file.name : "Choose file (PDF/DOC/DOCX, max 2 MB)"}
            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0] ?? null)}
            />
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!name.trim() || !file || upload.isPending}
            startIcon={upload.isPending ? Spinner : null}
          >
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
        </Stack>
        {upload.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {upload.error?.response?.data?.message ?? "Upload failed"}
          </Alert>
        )}
      </Paper>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Could not load resumes</Alert>}

      {!isLoading && !isError && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    No resumes yet. Upload your first version above.
                  </TableCell>
                </TableRow>
              )}
              {data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.fileName}</TableCell>
                  <TableCell>{(r.sizeBytes / 1024).toFixed(0)} KB</TableCell>
                  <TableCell>
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setToCheck(r)}>
                      Analyze
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDownload(r)}
                      disabled={downloadingId === r.id}
                      startIcon={downloadingId === r.id ? Spinner : null}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => remove.mutate(r.id)}
                      disabled={remove.isPending && remove.variables === r.id}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      {toCheck && (
        <ResumeCheckDialog
          key={toCheck.id}
          resume={toCheck}
          onClose={() => setToCheck(null)}
        />
      )}
    </Stack>
  );
}
