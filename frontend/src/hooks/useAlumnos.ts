import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Alumno {
  AlumnoId: number;
  AlumnoCodigoIdentificador: number;
  AlumnoCI: string;
  AlumnoNombre: string;
  AlumnoApellido: string;
  CursoId: number;
  CursoNombre?: string;
}

interface FiltrosAlumnos extends PaginationParams {
  nombre?: string;
  ci?: string;
  cursoId?: number;
}

export function useAlumnos(filtros: FiltrosAlumnos = {}) {
  return useQuery<PaginatedResponse<Alumno>>({
    queryKey: ["alumnos", filtros],
    queryFn: () => api.get(`/alumnos${buildPaginationQuery(filtros)}`),
  });
}

export function useBuscarAlumnos(busqueda: string) {
  return useQuery<PaginatedResponse<Alumno>>({
    queryKey: ["alumnos-buscar", busqueda],
    queryFn: () => api.get(`/alumnos${buildPaginationQuery({ busqueda, limit: 20 })}`),
    enabled: busqueda.trim().length >= 2,
  });
}

export function useCrearAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/alumnos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}

export function useActualizarAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/alumnos/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}

export function useEliminarAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/alumnos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}
