import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  AlumnoNombre?: string;
  AlumnoApellido?: string;
  AlumnoCI?: string;
  UsuarioNombre?: string;
  UsuarioApellido?: string;
}

interface FiltrosCobranzas {
  fechaDesde?: string;
  fechaHasta?: string;
  alumnoId?: number;
}

function buildQuery(filtros: FiltrosCobranzas) {
  const params = new URLSearchParams();
  if (filtros.fechaDesde) params.set("fechaDesde", filtros.fechaDesde);
  if (filtros.fechaHasta) params.set("fechaHasta", filtros.fechaHasta);
  if (filtros.alumnoId) params.set("alumnoId", String(filtros.alumnoId));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function useCobranzas(filtros: FiltrosCobranzas = {}) {
  return useQuery<Cobranza[]>({
    queryKey: ["cobranzas", filtros],
    queryFn: () => api.get(`/cobranzas${buildQuery(filtros)}`),
  });
}

export function useCrearCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/cobranzas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobranzas"] }),
  });
}

export function useEliminarCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/cobranzas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobranzas"] }),
  });
}
