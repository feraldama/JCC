import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Perfil {
  PerfilId: number;
  PerfilDescripcion: string;
  menus?: { MenuId: string; MenuNombre: string }[];
}

export interface Menu {
  MenuId: string;
  MenuNombre: string;
}

export function usePerfiles(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Perfil>>({
    queryKey: ["perfiles", filtros],
    queryFn: () => api.get(`/perfiles${buildPaginationQuery(filtros)}`),
  });
}

export function useMenus() {
  return useQuery<Menu[]>({
    queryKey: ["menus"],
    queryFn: () => api.get("/menus"),
  });
}

export function useCrearPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { PerfilDescripcion: string }) => api.post("/perfiles", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}

export function useActualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; PerfilDescripcion: string }) =>
      api.put(`/perfiles/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}

export function useEliminarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/perfiles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}

export function useAsignarMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, menus }: { id: number; menus: string[] }) =>
      api.post(`/perfiles/${id}/menus`, { menus }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}
