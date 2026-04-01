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
  CursoImporte?: number;
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

export interface MesEstadoCuenta {
  mes: number;
  nombre: string;
  pagado: boolean;
  monto: number;
  cobranzaId: number | null;
  fecha: string | null;
}

export interface EstadoCuenta {
  alumno: {
    AlumnoId: number;
    AlumnoNombre: string;
    AlumnoApellido: string;
    AlumnoCI: string;
    CursoNombre: string;
    CursoImporte: number;
  };
  anio: number;
  meses: MesEstadoCuenta[];
  totalPagado: number;
  totalPendiente: number;
}

export function useEstadoCuenta(alumnoId: number, anio: number) {
  return useQuery<EstadoCuenta>({
    queryKey: ["estado-cuenta", alumnoId, anio],
    queryFn: () => api.get(`/alumnos/${alumnoId}/estado-cuenta?anio=${anio}`),
    enabled: alumnoId > 0,
  });
}
