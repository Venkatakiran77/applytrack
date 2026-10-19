import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import StatusChip from "./StatusChip";
import { STATUSES } from "../utils/constants";

const COLUMNS = [
  { id: "company", label: "Company", sortable: true },
  { id: "role", label: "Role", sortable: true },
  { id: "status", label: "Status", sortable: false },
  { id: "resumeVersion", label: "Resume", sortable: true },
  { id: "appliedOn", label: "Applied", sortable: true },
];

function StatusSelect({ app, onStatusChange }) {
  return (
    <Select
      variant="outlined"
      size="small"
      value={app.status}
      onChange={(e) => onStatusChange(app.id, e.target.value)}
      renderValue={(value) => <StatusChip status={value} />}
      inputProps={{ "aria-label": `Status for ${app.company}` }}
      sx={{
        minWidth: 130,
        maxWidth: "100%",
        "& .MuiSelect-select": {
          py: 0.75,
          pr: 4,
        },
      }}
    >
      {STATUSES.map((status) => (
        <MenuItem key={status} value={status}>
          <StatusChip status={status} />
        </MenuItem>
      ))}
    </Select>
  );
}

function ApplicationActions({ app, onEdit, onDelete }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title="Edit application">
        <IconButton
          size="medium"
          aria-label={`Edit ${app.company}`}
          onClick={() => onEdit(app)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete application">
        <IconButton
          size="medium"
          color="error"
          aria-label={`Delete ${app.company}`}
          onClick={() => onDelete(app)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function MobileApplicationCard({
  app,
  navigate,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        minWidth: 0,
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="button"
            onClick={() => navigate(`/applications/${app.id}`)}
            sx={{
              display: "block",
              width: "100%",
              p: 0,
              border: 0,
              background: "none",
              color: "primary.main",
              font: "inherit",
              fontWeight: 700,
              fontSize: "1rem",
              textAlign: "left",
              overflowWrap: "anywhere",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {app.company}
          </Typography>

          {app.followUpNeeded && (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label="Follow up"
              sx={{ mt: 1 }}
            />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, overflowWrap: "anywhere" }}
          >
            {app.role}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Resume
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {app.resumeVersion || "-"}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Applied on
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {app.appliedOn || "-"}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.75 }}
          >
            Application status
          </Typography>

          <StatusSelect app={app} onStatusChange={onStatusChange} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: 1,
            borderColor: "divider",
            pt: 1,
          }}
        >
          <ApplicationActions app={app} onEdit={onEdit} onDelete={onDelete} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ApplicationsTable({
  rows,
  total,
  page,
  rowsPerPage,
  sort,
  loading,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      sx={{
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        borderRadius: { xs: 2, sm: 3 },
      }}
    >
      {loading && <LinearProgress />}

      {isMobile ? (
        <Stack spacing={1.5} sx={{ p: 1.5 }}>
          {rows.map((app) => (
            <MobileApplicationCard
              key={app.id}
              app={app}
              navigate={navigate}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {!loading && rows.length === 0 && (
            <Box sx={{ py: 5, px: 1, textAlign: "center" }}>
              <Typography fontWeight={600}>No applications found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add your first application to get started.
              </Typography>
            </Box>
          )}
        </Stack>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 760 }} aria-label="Job applications">
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    sortDirection={
                      sort.field === col.id ? sort.direction : false
                    }
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sort.field === col.id}
                        direction={
                          sort.field === col.id ? sort.direction : "asc"
                        }
                        onClick={() => onSortChange(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell sx={{ minWidth: 160, maxWidth: 240 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography
                        component="button"
                        onClick={() => navigate(`/applications/${app.id}`)}
                        sx={{
                          p: 0,
                          border: 0,
                          background: "none",
                          font: "inherit",
                          fontWeight: 600,
                          color: "text.primary",
                          textAlign: "left",
                          cursor: "pointer",
                          overflowWrap: "anywhere",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {app.company}
                      </Typography>

                      {app.followUpNeeded && (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label="Follow up"
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ minWidth: 140 }}>{app.role}</TableCell>

                  <TableCell>
                    <StatusSelect app={app} onStatusChange={onStatusChange} />
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    {app.resumeVersion || "-"}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {app.appliedOn || "-"}
                  </TableCell>

                  <TableCell align="right">
                    <ApplicationActions
                      app={app}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length + 1}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography color="text.secondary">
                      No applications found. Add your first one to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        sx={{
          ".MuiTablePagination-toolbar": {
            px: { xs: 1, sm: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            justifyContent: { xs: "center", sm: "flex-end" },
            minHeight: 64,
            rowGap: 1,
          },
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
            {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
        }}
      />
    </Paper>
  );
}
