import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, action }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-end"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            color: "primary.light",
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h4">{title}</Typography>
      </Box>
      {action}
    </Stack>
  );
}
