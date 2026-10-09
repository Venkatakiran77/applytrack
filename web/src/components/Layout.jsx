import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/applications", label: "Applications" },
  { to: "/skills", label: "Skills" },
];

export default function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
                background: "linear-gradient(135deg, #7c6cf0, #a45df0)",
              }}
            >
              AT
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mr: 4, ml: 1 }}
            >
              ApplyTrack
            </Typography>

            {LINKS.map((l) => (
              <Button
                key={l.to}
                component={NavLink}
                to={l.to}
                end={l.end}
                sx={{
                  color: "text.secondary",
                  borderRadius: 0,
                  px: 1.5,
                  py: 3.2,
                  borderBottom: "2px solid transparent",
                  "&:hover": {
                    color: "text.primary",
                    background: "transparent",
                  },
                  "&.active": {
                    color: "text.primary",
                    borderBottomColor: "primary.main",
                  },
                }}
              >
                {l.label}
              </Button>
            ))}

            <Box sx={{ flexGrow: 1 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
            >
              {email}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Outlet />
      </Container>
    </>
  );
}
