import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

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

export function useCrearPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/pagos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos"] }),
  });
}

export function useEliminarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pagos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos"] }),
  });
}
