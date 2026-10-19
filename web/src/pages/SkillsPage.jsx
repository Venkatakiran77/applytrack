import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import { useAddSkill, useDeleteSkill, useSkills } from "../hooks/useSkills";
import { getErrorMessage } from "../utils/errors";

export default function SkillsPage() {
  const [name, setName] = useState("");

  const { data: skills = [], isLoading, isError, error } = useSkills();

  const addMutation = useAddSkill();
  const deleteMutation = useDeleteSkill();

  const handleAdd = (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    addMutation.mutate(trimmed, {
      onSuccess: () => setName(""),
    });
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader eyebrow="Your toolkit" title="Skills" />

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          minWidth: 0,
        }}
      >
        <Typography
          color="text.secondary"
          sx={{
            mb: 2,
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            lineHeight: 1.7,
          }}
        >
          These are compared against the keywords found in each job description.
          Use the names job posts use, like <b>java</b>, <b>spring boot</b>,{" "}
          <b>react</b> or <b>docker</b>.
        </Typography>

        <Box component="form" onSubmit={handleAdd}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "flex-start" }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Add a skill and press Enter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 100 },
              }}
              sx={{
                minWidth: 0,
                "& .MuiInputBase-root": {
                  minHeight: 42,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={addMutation.isPending || !name.trim()}
              fullWidth={false}
              sx={{
                minWidth: { xs: "100%", sm: 90 },
                minHeight: 42,
                flexShrink: 0,
              }}
            >
              {addMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add"
              )}
            </Button>
          </Stack>
        </Box>

        {addMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(addMutation.error)}
          </Alert>
        )}
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 3 },
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {skills.length} skill{skills.length === 1 ? "" : "s"}
          </Typography>
        </Stack>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!isLoading && !isError && skills.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            No skills yet. Add the technologies you know.
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            width: "100%",
            minWidth: 0,
            "& .MuiChip-root": {
              maxWidth: "100%",
              height: "auto",
              minHeight: 32,
            },
            "& .MuiChip-label": {
              display: "block",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              py: 0.75,
            },
          }}
        >
          {skills.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              color="primary"
              variant="outlined"
              onDelete={() => deleteMutation.mutate(s.id)}
              disabled={deleteMutation.isPending}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
