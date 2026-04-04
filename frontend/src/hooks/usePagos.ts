import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";
import type { Empleado } from "./useEmpleados";

export interface Pago {
  PagoEmpleadoId: number;
  PagoEmpleadoFecha: string;
  EmpleadoId: number;
  PagoEmpleadoEntregaMonto: number;
  PagoEmpleadoSaldoMonto: number;
  UsuarioId: string;
  PagoEmpleadoNroRecibo: number;
  EmpleadoNombre?: string;
  EmpleadoApellido?: string;
  EmpleadoCI?: string;
  UsuarioNombre?: string;
  UsuarioApellido?: string;
}

interface FiltrosPagos extends PaginationParams {
  fechaDesde?: string;
  fechaHasta?: string;
  empleadoId?: number;
}

export function usePagos(filtros: FiltrosPagos = {}) {
  return useQuery<PaginatedResponse<Pago>>({
    queryKey: ["pagos", filtros],
    queryFn: () => api.get(`/pagos${buildPaginationQuery(filtros)}`),
  });
}

export interface PagosEmpleadoResponse {
  empleado: Empleado;
  pagos: Pago[];
  salarioTotal: number;
  totalEntregado: number;
  saldoTotal: number;
}

export function usePagosEmpleado(empleadoId: number | undefined, mes: number, anio: number) {
  return useQuery<PagosEmpleadoResponse>({
    queryKey: ["pagos-empleado", empleadoId, mes, anio],
    queryFn: () => api.get(`/pagos/empleado/${empleadoId}?mes=${mes}&anio=${anio}`),
    enabled: !!empleadoId,
  });
}

export function useSiguienteRecibo() {
  return useQuery<{ siguiente: number }>({
    queryKey: ["siguiente-recibo"],
    queryFn: () => api.get("/pagos/siguiente-recibo/next"),
  });
}

export function useCrearPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/pagos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagos"] });
      qc.invalidateQueries({ queryKey: ["pagos-empleado"] });
      qc.invalidateQueries({ queryKey: ["siguiente-recibo"] });
    },
  });
}

export function useEliminarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pagos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagos"] });
      qc.invalidateQueries({ queryKey: ["pagos-empleado"] });
      qc.invalidateQueries({ queryKey: ["siguiente-recibo"] });
    },
  });
}
