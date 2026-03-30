import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Factura {
  FacturaId: number;
  Timbrado: string;
  NumeroDesde: number;
  NumeroHasta: number;
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
    mutationFn: (data: Omit<Factura, "FacturaId">) =>
      api.post("/facturas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  });
}

export function useActualizarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Factura> & { id: number }) =>
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
