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

export interface AlumnoEstadoCuentaGrado {
  AlumnoId: number;
  AlumnoNombre: string;
  AlumnoApellido: string;
  AlumnoCI: string;
  meses: { mes: number; nombre: string; pagado: boolean; monto: number }[];
  totalPagado: number;
  totalPendiente: number;
}

export interface EstadoCuentaGrado {
  curso: { CursoId: number; CursoNombre: string; CursoImporte: number };
  anio: number;
  alumnos: AlumnoEstadoCuentaGrado[];
  totalGeneralPagado: number;
  totalGeneralPendiente: number;
}

export function useEstadoCuentaGrado(cursoId: number, anio: number) {
  return useQuery<EstadoCuentaGrado>({
    queryKey: ["estado-cuenta-grado", cursoId, anio],
    queryFn: () => api.get(`/cursos/${cursoId}/estado-cuenta?anio=${anio}`),
    enabled: cursoId > 0,
  });
}
