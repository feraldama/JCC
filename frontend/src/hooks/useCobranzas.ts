import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Cobranza {
  CobranzaId: number;
  Fecha: string;
  AlumnoId: number;
  MesPagado: string;
  Subtotal: number;
  Mora: number;
  Total: number;
  Alumno?: { Nombre: string; Apellido: string };
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
    mutationFn: (data: Omit<Cobranza, "CobranzaId" | "Alumno">) =>
      api.post("/cobranzas", data),
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
