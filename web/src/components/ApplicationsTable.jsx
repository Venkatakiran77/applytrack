import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
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

  return (
    <Paper sx={{ overflow: "hidden" }}>
      {loading && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  sortDirection={sort.field === col.id ? sort.direction : false}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort.field === col.id}
                      direction={sort.field === col.id ? sort.direction : "asc"}
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
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": { color: "primary.light" },
                      }}
                      onClick={() => navigate(`/applications/${app.id}`)}
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
                  </Box>
                </TableCell>
                <TableCell>{app.role}</TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    disableUnderline
                    size="small"
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value)}
                    renderValue={(value) => <StatusChip status={value} />}
                    sx={{ "& .MuiSelect-select": { py: 0.5 } }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        <StatusChip status={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{app.resumeVersion ?? "-"}</TableCell>
                <TableCell>{app.appliedOn ?? "-"}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(app)}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete(app)}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
      />
    </Paper>
  );
}
