import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Usuario {
  UsuarioId: string;
  UsuarioNombre: string;
  UsuarioApellido: string;
  UsuarioCorreo: string;
  UsuarioIsAdmin: string;
  UsuarioEstado: string;
}

export function useUsuarios(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Usuario>>({
    queryKey: ["usuarios", filtros],
    queryFn: () => api.get(`/usuarios${buildPaginationQuery(filtros)}`),
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/usuarios", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.put(`/usuarios/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/usuarios/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export interface PerfilAsignado {
  PerfilId: number;
  PerfilDescripcion: string;
}

export function usePerfilesUsuario(usuarioId: string | null) {
  return useQuery<PerfilAsignado[]>({
    queryKey: ["usuario-perfiles", usuarioId],
    queryFn: () => api.get(`/usuarios/${usuarioId}/perfiles`),
    enabled: !!usuarioId,
  });
}

export function useAsignarPerfiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, perfiles }: { id: string; perfiles: number[] }) =>
      api.post(`/usuarios/${id}/perfiles`, { perfiles }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuario-perfiles"] });
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
