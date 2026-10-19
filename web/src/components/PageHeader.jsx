import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, action }) {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3 }, minWidth: 0, width: "100%" }}>
      <Typography
        variant="overline"
        color="primary"
        sx={{
          display: "block",
          fontWeight: 700,
          letterSpacing: 1.5,
          lineHeight: 1.5,
          mb: 0.5,
          overflowWrap: "anywhere",
        }}
      >
        {eyebrow}
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ minWidth: 0 }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{
            lineHeight: 1.2,
            fontSize: {
              xs: "1.65rem",
              sm: "2rem",
              md: "2.125rem",
            },
            overflowWrap: "anywhere",
            minWidth: 0,
          }}
        >
          {title}
        </Typography>

        {action && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              alignSelf: { xs: "stretch", sm: "center" },
              flexShrink: 0,
              "& > *": {
                maxWidth: "100%",
              },
            }}
          >
            {action}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
