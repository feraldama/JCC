import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Factura {
  FacturaId: number;
  FacturaTimbrado: number;
  FacturaDesde: number;
  FacturaHasta: number;
}

export function useFacturas(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Factura>>({
    queryKey: ["facturas", filtros],
    queryFn: () => api.get(`/facturas${buildPaginationQuery(filtros)}`),
  });
}

export function useCrearFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/facturas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  });
}

export function useActualizarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/facturas/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  });
}

export function useEliminarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/facturas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  });
}
