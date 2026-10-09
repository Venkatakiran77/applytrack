import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
    addMutation.mutate(trimmed, { onSuccess: () => setName("") });
  };

  return (
    <>
      <PageHeader eyebrow="Your toolkit" title="Skills" />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          These are compared against the keywords found in each job description.
          Use the names job posts use, like <b>java</b>, <b>spring boot</b>,{" "}
          <b>react</b> or <b>docker</b>.
        </Typography>
        <Box component="form" onSubmit={handleAdd}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a skill and press Enter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={addMutation.isPending || !name.trim()}
            >
              Add
            </Button>
          </Stack>
        </Box>
        {addMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(addMutation.error)}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {skills.length} skill{skills.length === 1 ? "" : "s"}
        </Typography>
        {isError && <Alert severity="error">{getErrorMessage(error)}</Alert>}
        {!isLoading && skills.length === 0 && (
          <Typography color="text.secondary">
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
              sx={{
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          ))}
        </Box>
      </Paper>
    </>
  );
}
