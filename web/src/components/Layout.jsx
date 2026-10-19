import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../auth/AuthContext";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/applications", label: "Applications" },
  { to: "/skills", label: "Skills" },
  { to: "/resumes", label: "Resumes" },
];

export default function Layout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate("/login", { replace: true });
  };

  const navButtonSx = {
    color: "text.secondary",
    borderRadius: 2,
    px: 1.5,
    py: 1,
    whiteSpace: "nowrap",
    "&:hover": {
      color: "text.primary",
      backgroundColor: "action.hover",
    },
    "&.active": {
      color: "primary.main",
      backgroundColor: "action.selected",
      fontWeight: 700,
    },
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 60, sm: 72 },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                background: "linear-gradient(135deg, #7c6cf0, #a45df0)",
              }}
            >
              AT
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.4px",
                mr: { xs: 0, md: 2 },
                flexGrow: { xs: 1, md: 0 },
                whiteSpace: "nowrap",
              }}
            >
              ApplyTrack
            </Typography>

            {/* Desktop navigation */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.5,
                flexGrow: 1,
              }}
            >
              {LINKS.map((link) => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  sx={navButtonSx}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={email || ""}
              sx={{
                display: { xs: "none", sm: "block" },
                maxWidth: { sm: 140, lg: 220 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                ml: "auto",
              }}
            >
              {email}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Logout
            </Button>

            {/* Mobile menu button */}
            <IconButton
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: {
            width: "min(82vw, 320px)",
            pt: 2,
            backgroundColor: "background.paper",
          },
        }}
      >
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="h6" fontWeight={800}>
            ApplyTrack
          </Typography>
          {email && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: "anywhere" }}
            >
              {email}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <List sx={{ px: 1 }}>
          {LINKS.map((link) => (
            <ListItemButton
              key={link.to}
              component={NavLink}
              to={link.to}
              end={link.end}
              onClick={closeMobileMenu}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.active": {
                  color: "primary.main",
                  backgroundColor: "action.selected",
                  "& .MuiListItemText-primary": {
                    fontWeight: 700,
                  },
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2.5, sm: 4, md: 5 },
          px: { xs: 2, sm: 3 },
          minWidth: 0,
        }}
      >
        <Outlet />
      </Container>
    </>
  );
}
