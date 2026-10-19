import { Paper, Typography } from "@mui/material";

export default function StatCard({ label, value, color = "primary" }) {
  return (
    <Paper
      sx={(theme) => ({
        p: { xs: 2, sm: 2.5 }, // Smaller padding on mobile to save space
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor:
            theme.palette[color]?.main || theme.palette.primary.main,
        },
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          mt: 0.5,
          fontSize: { xs: "1.5rem", sm: "2.125rem" }, // Scaled down on mobile to prevent awkward wrapping
          wordBreak: "break-word", // Prevents long text/numbers from breaking the card layout
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}
