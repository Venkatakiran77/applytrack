import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { STATUS_COLOR } from "../utils/constants";

const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function StatusChip({ status }) {
  const key = STATUS_COLOR[status] ?? "info";
  return (
    <Chip
      size="small"
      label={label(status)}
      sx={(theme) => ({
        bgcolor: alpha(theme.palette[key].main, 0.15),
        color: theme.palette[key].light ?? theme.palette[key].main,
        border: `1px solid ${alpha(theme.palette[key].main, 0.4)}`,
      })}
    />
  );
}
