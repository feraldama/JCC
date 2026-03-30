import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Factura {
  FacturaId: number;
  FacturaTimbrado: number;
  FacturaDesde: number;
  FacturaHasta: number;
}

export function useFacturas() {
  return useQuery<Factura[]>({
    queryKey: ["facturas"],
    queryFn: () => api.get("/facturas"),
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
