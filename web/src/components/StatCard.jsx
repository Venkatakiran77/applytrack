import { Paper, Typography } from "@mui/material";

export default function StatCard({ label, value, color = "primary" }) {
  return (
    <Paper
      sx={(theme) => ({
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: theme.palette[color].main,
        },
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}
