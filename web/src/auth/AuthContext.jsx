import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginRequest, registerRequest } from "../api/authApi";
import { TOKEN_KEY, EMAIL_KEY } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY));

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, data.email);
    setToken(data.token);
    setEmail(data.email);
  }, []);

  const login = useCallback(
    async (emailInput, password) =>
      saveSession(await loginRequest(emailInput, password)),
    [saveSession],
  );

  const register = useCallback(
    async (emailInput, password) =>
      saveSession(await registerRequest(emailInput, password)),
    [saveSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail(null);
    queryClient.clear(); // never show the previous user's cached data to the next login
  }, [queryClient]);

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, email, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
