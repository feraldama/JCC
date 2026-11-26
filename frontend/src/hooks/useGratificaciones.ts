import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

// Un empleado con su gratificación del año consultado (campos null si no tiene).
export interface GratificacionEmpleado {
  EmpleadoId: number;
  EmpleadoCI: string;
  EmpleadoNombre: string;
  EmpleadoApellido: string;
  EmpleadoCobroMonto: number;
  GratificacionId: number | null;
  GratificacionMonto: number | null;
  GratificacionFecha: string | null;
  GratificacionNroRecibo: number | null;
}

export interface GratificacionesResponse extends PaginatedResponse<GratificacionEmpleado> {
  totalMonto: number;
  cantidadCargados: number;
}

export interface Gratificacion {
  GratificacionId: number;
  GratificacionAnio: number;
  EmpleadoId: number;
  GratificacionMonto: number;
  GratificacionFecha: string;
  GratificacionNroRecibo: number;
  UsuarioId: string;
}

interface FiltrosGratificaciones extends PaginationParams {
  anio: number;
}

export function useGratificaciones(filtros: FiltrosGratificaciones) {
  return useQuery<GratificacionesResponse>({
    queryKey: ["gratificaciones", filtros],
    queryFn: () => api.get(`/gratificaciones${buildPaginationQuery(filtros)}`),
  });
}

export function useGuardarGratificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      GratificacionAnio: number;
      EmpleadoId: number;
      GratificacionMonto: number;
      GratificacionFecha: string;
    }) => api.put<Gratificacion>("/gratificaciones", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gratificaciones"] }),
  });
}

export function useGuardarGratificacionesLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      GratificacionAnio: number;
      GratificacionFecha: string;
      items: { EmpleadoId: number; GratificacionMonto: number }[];
    }) => api.put<{ guardados: number; data: Gratificacion[] }>("/gratificaciones/lote", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gratificaciones"] }),
  });
}

// Todos los empleados con gratificación cargada en el año (para imprimir el lote).
export function obtenerGratificacionesDelAnio(anio: number) {
  return api
    .get<GratificacionesResponse>(
      `/gratificaciones${buildPaginationQuery({ anio, limit: 10000, sortBy: "EmpleadoApellido", sortDir: "asc" })}`,
    )
    .then((r) => r.data.filter((e) => e.GratificacionId !== null));
}

export function useEliminarGratificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/gratificaciones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gratificaciones"] }),
  });
}
