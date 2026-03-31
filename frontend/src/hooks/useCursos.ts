import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Curso {
  CursoId: number;
  CursoNombre: string;
  CursoImporte: number;
}

export function useCursos(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Curso>>({
    queryKey: ["cursos", filtros],
    queryFn: () => api.get(`/cursos${buildPaginationQuery(filtros)}`),
  });
}

export function useCrearCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/cursos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

export function useActualizarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/cursos/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

export function useEliminarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/cursos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}
