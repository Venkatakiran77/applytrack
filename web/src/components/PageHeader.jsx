import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, action }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        color="primary"
        sx={{
          display: "block",
          fontWeight: 700,
          letterSpacing: 1.5,
          lineHeight: 1.5,
        }}
      >
        {eyebrow}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{ lineHeight: 1.2 }}
        >
          {title}
        </Typography>

        {action && (
          <Box sx={{ display: "flex", alignItems: "center" }}>{action}</Box>
        )}
      </Stack>
    </Box>
  );
}
