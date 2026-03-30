import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

interface FiltrosPagos {
  fechaDesde?: string;
  fechaHasta?: string;
  empleadoId?: number;
}

function buildQuery(filtros: FiltrosPagos) {
  const params = new URLSearchParams();
  if (filtros.fechaDesde) params.set("fechaDesde", filtros.fechaDesde);
  if (filtros.fechaHasta) params.set("fechaHasta", filtros.fechaHasta);
  if (filtros.empleadoId) params.set("empleadoId", String(filtros.empleadoId));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function usePagos(filtros: FiltrosPagos = {}) {
  return useQuery<Pago[]>({
    queryKey: ["pagos", filtros],
    queryFn: () => api.get(`/pagos${buildQuery(filtros)}`),
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
