import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  return (
    <Typography variant="h5">Application #{id} (coming in Phase 8)</Typography>
  );
}
