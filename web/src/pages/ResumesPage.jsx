import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import AnalyticsOutlined from "@mui/icons-material/AnalyticsOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import {
  useDeleteResume,
  useResumes,
  useUploadResume,
} from "../hooks/useResumes";
import { downloadResume } from "../api/resumesApi";
import ResumeCheckDialog from "../components/ResumeCheckDialog";

const Spinner = <CircularProgress size={16} color="inherit" />;

function formatSize(sizeBytes) {
  if (sizeBytes == null) return "-";
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(0)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
}

function ResumeActions({
  resume,
  downloadingId,
  onAnalyze,
  onDownload,
  onDelete,
  deleting,
  mobile = false,
}) {
  return (
    <Stack
      direction={mobile ? "column" : "row"}
      spacing={1}
      sx={{ width: mobile ? "100%" : "auto", minWidth: 0 }}
    >
      <Button
        size="small"
        variant={mobile ? "outlined" : "text"}
        startIcon={<AnalyticsOutlined />}
        onClick={() => onAnalyze(resume)}
        fullWidth={mobile}
        sx={{ whiteSpace: "nowrap" }}
      >
        Analyze
      </Button>

      <Button
        size="small"
        variant={mobile ? "outlined" : "text"}
        startIcon={downloadingId === resume.id ? Spinner : <DownloadOutlined />}
        onClick={() => onDownload(resume)}
        disabled={downloadingId === resume.id}
        fullWidth={mobile}
        sx={{ whiteSpace: "nowrap" }}
      >
        {downloadingId === resume.id ? "Downloading…" : "Download"}
      </Button>

      <Button
        size="small"
        color="error"
        variant={mobile ? "outlined" : "text"}
        startIcon={<DeleteOutlined />}
        onClick={() => onDelete(resume.id)}
        disabled={deleting}
        fullWidth={mobile}
        sx={{ whiteSpace: "nowrap" }}
      >
        Delete
      </Button>
    </Stack>
  );
}

export default function ResumesPage() {
  const { data = [], isLoading, isError } = useResumes();
  const upload = useUploadResume();
  const remove = useDeleteResume();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [toCheck, setToCheck] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const submit = (e) => {
    e.preventDefault();

    if (!name.trim() || !file || upload.isPending) return;

    upload.mutate(
      { name: name.trim(), file },
      {
        onSuccess: () => {
          setName("");
          setFile(null);
        },
      },
    );
  };

  const handleDownload = async (resume) => {
    setDownloadingId(resume.id);
    setDownloadError("");

    try {
      await downloadResume(resume);
    } catch {
      setDownloadError(
        `Could not download "${resume.name}". Please try again.`,
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id) => {
    remove.mutate(id);
  };

  return (
    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ minWidth: 0, width: "100%" }}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          Resumes
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your resume versions and analyze them for job applications.
        </Typography>
      </Box>

      {/* Upload section */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 3, sm: 3 },
          minWidth: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <CloudUploadOutlined color="primary" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{ fontSize: "1.05rem", fontWeight: 700 }}
            >
              Upload a resume
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF, DOC or DOCX · Maximum 2 MB
            </Typography>
          </Box>
        </Stack>

        <Box component="form" onSubmit={submit}>
          <Stack spacing={1.5}>
            <TextField
              label="Resume version name"
              placeholder="e.g. Java Developer, V1, Frontend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 60 } }}
              size="small"
              fullWidth
            />

            <Button
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<DescriptionOutlined />}
              sx={{
                minHeight: 44,
                justifyContent: "flex-start",
                px: 1.5,
                textTransform: "none",
                overflow: "hidden",
              }}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {file ? file.name : "Choose resume file"}
              </Box>

              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>

            {file && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Chip
                  size="small"
                  icon={<DescriptionOutlined />}
                  label={file.name}
                  onDelete={() => setFile(null)}
                  sx={{ maxWidth: "100%" }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0 }}
                >
                  {formatSize(file.size)}
                </Typography>
              </Stack>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={!name.trim() || !file || upload.isPending}
              startIcon={upload.isPending ? Spinner : <CloudUploadOutlined />}
              fullWidth
              sx={{ minHeight: 44 }}
            >
              {upload.isPending ? "Uploading…" : "Upload resume"}
            </Button>
          </Stack>
        </Box>

        {file && file.size > 2 * 1024 * 1024 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This file exceeds 2 MB. Choose a smaller file.
          </Alert>
        )}

        {upload.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {upload.error?.response?.data?.message ?? "Upload failed"}
          </Alert>
        )}
      </Paper>

      {downloadError && (
        <Alert severity="error" onClose={() => setDownloadError("")}>
          {downloadError}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          Could not load resumes. Please try again.
        </Alert>
      )}

      {/* Resume list */}
      {!isLoading && !isError && (
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Your resumes
            </Typography>

            <Chip
              size="small"
              label={`${data.length} ${data.length === 1 ? "resume" : "resumes"}`}
              variant="outlined"
            />
          </Stack>

          {data.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, sm: 5 },
                textAlign: "center",
                borderRadius: 3,
              }}
            >
              <DescriptionOutlined
                sx={{ fontSize: 44, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No resumes yet
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                Upload your first resume version to get started.
              </Typography>
            </Paper>
          ) : isMobile ? (
            /* Mobile: individual resume cards */
            <Stack spacing={1.5}>
              {data.map((r) => (
                <Card
                  key={r.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    minWidth: 0,
                    overflow: "hidden",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2,
                          bgcolor: "action.hover",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <DescriptionOutlined
                          color="primary"
                          fontSize="medium"
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                            lineHeight: 1.4,
                          }}
                        >
                          {r.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflowWrap: "anywhere",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {r.fileName}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ mt: 2, mb: 2 }}
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatSize(r.sizeBytes)}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Uploaded ${formatDate(r.uploadedAt)}`}
                      />
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    <ResumeActions
                      resume={r}
                      downloadingId={downloadingId}
                      onAnalyze={setToCheck}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      deleting={remove.isPending && remove.variables === r.id}
                      mobile
                    />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            /* Desktop/tablet: data table */
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3, overflowX: "auto" }}
            >
              <Table sx={{ minWidth: 650 }}>
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
                  {data.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell
                        sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                      >
                        {r.name}
                      </TableCell>
                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {r.fileName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatSize(r.sizeBytes)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(r.uploadedAt)}
                      </TableCell>
                      <TableCell align="right">
                        <ResumeActions
                          resume={r}
                          downloadingId={downloadingId}
                          onAnalyze={setToCheck}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          deleting={
                            remove.isPending && remove.variables === r.id
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
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
