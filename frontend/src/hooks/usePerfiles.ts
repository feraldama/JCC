import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Perfil {
  PerfilId: number;
  Nombre: string;
  Menus?: { MenuId: string; Nombre: string }[];
}

export interface Menu {
  MenuId: string;
  Nombre: string;
}

export function usePerfiles() {
  return useQuery<Perfil[]>({
    queryKey: ["perfiles"],
    queryFn: () => api.get("/perfiles"),
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
    mutationFn: (data: { Nombre: string }) => api.post("/perfiles", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}

export function useActualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; Nombre: string }) =>
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
    mutationFn: ({ id, menuIds }: { id: number; menuIds: string[] }) =>
      api.post(`/perfiles/${id}/menus`, { menuIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfiles"] }),
  });
}
