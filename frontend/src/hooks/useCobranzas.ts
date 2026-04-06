import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Cobranza {
  CobranzaId: number;
  CobranzaFecha: string;
  AlumnoId: number;
  CobranzaMesPagado: string;
  CobranzaMes: number;
  CobranzaSubtotalCuota: number;
  CobranzaDiasMora: number;
  CobranzaExamen: number;
  CobranzaDescuento: number;
  UsuarioId: string;
  CobranzaNroComprobante: number;
  CobranzaTimbrado: number;
  CobranzaFebrero: string;
  CobranzaAdicionalDetalle: string;
  CobranzaEstado: string;
  AlumnoNombre?: string;
  AlumnoApellido?: string;
  AlumnoCI?: string;
  CursoNombre?: string;
  UsuarioNombre?: string;
  UsuarioApellido?: string;
}

interface FiltrosCobranzas extends PaginationParams {
  fechaDesde?: string;
  fechaHasta?: string;
  alumnoId?: number;
}

export function useCobranzas(filtros: FiltrosCobranzas = {}) {
  return useQuery<PaginatedResponse<Cobranza>>({
    queryKey: ["cobranzas", filtros],
    queryFn: () => api.get(`/cobranzas${buildPaginationQuery(filtros)}`),
  });
}

export function useCobranza(id: number | null) {
  return useQuery<Cobranza>({
    queryKey: ["cobranzas", id],
    queryFn: () => api.get(`/cobranzas/${id}`),
    enabled: id !== null && id > 0,
  });
}

export function useUltimoComprobante(enabled: boolean) {
  return useQuery<{ CobranzaNroComprobante: number; CobranzaTimbrado: number; FacturaDesde: number; FacturaHasta: number }>({
    queryKey: ["cobranzas", "ultimo-comprobante"],
    queryFn: () => api.get("/cobranzas/ultimo-comprobante"),
    enabled,
  });
}

export function useCrearCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/cobranzas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobranzas"] }),
  });
}

export function useAnularCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put(`/cobranzas/${id}/anular`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobranzas"] }),
  });
}
