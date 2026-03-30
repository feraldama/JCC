"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { api } from "./api";

interface Menu {
  MenuId: string;
  MenuNombre: string;
}

interface Usuario {
  UsuarioId: string;
  UsuarioNombre: string;
  UsuarioApellido: string;
  UsuarioCorreo: string;
  UsuarioIsAdmin: string;
  UsuarioEstado: string;
}

interface AuthState {
  usuario: Usuario | null;
  menus: Menu[];
  token: string | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  menus: Menu[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (usuarioId: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    usuario: null,
    menus: [],
    token: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setState((s) => ({ ...s, token }));
      api
        .get<{ usuario: Usuario; menus: Menu[] }>("/auth/me")
        .then((data) => {
          setState({ token, usuario: data.usuario, menus: data.menus });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setState({ token: null, usuario: null, menus: [] });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (usuarioId: string, contrasena: string) => {
    const data = await api.post<{
      token: string;
      usuario: Usuario;
      menus: Menu[];
    }>("/auth/login", { UsuarioId: usuarioId, Contrasena: contrasena });
    localStorage.setItem("token", data.token);
    setState({ token: data.token, usuario: data.usuario, menus: data.menus });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({ token: null, usuario: null, menus: [] });
    window.location.href = "/login";
  }, []);

  return createElement(
    AuthContext.Provider,
    {
      value: {
        usuario: state.usuario,
        menus: state.menus,
        isAuthenticated: !!state.token,
        loading,
        login,
        logout,
      },
    },
    children
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
