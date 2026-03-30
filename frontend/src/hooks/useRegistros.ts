import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Registro {
  RegistroId: number;
  Fecha: string;
  TipoRegistro: string;
  Descripcion: string;
  Monto: number;
  AlumnoId?: number;
  Alumno?: { Nombre: string; Apellido: string };
}

interface FiltrosRegistros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoRegistro?: string;
  alumnoId?: number;
}

function buildQuery(filtros: FiltrosRegistros) {
  const params = new URLSearchParams();
  if (filtros.fechaDesde) params.set("fechaDesde", filtros.fechaDesde);
  if (filtros.fechaHasta) params.set("fechaHasta", filtros.fechaHasta);
  if (filtros.tipoRegistro) params.set("tipoRegistro", filtros.tipoRegistro);
  if (filtros.alumnoId) params.set("alumnoId", String(filtros.alumnoId));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function useRegistros(filtros: FiltrosRegistros = {}) {
  return useQuery<Registro[]>({
    queryKey: ["registros", filtros],
    queryFn: () => api.get(`/registros${buildQuery(filtros)}`),
  });
}

export function useCrearRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Registro, "RegistroId" | "Alumno">) =>
      api.post("/registros", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros"] }),
  });
}

export function useActualizarRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Registro> & { id: number }) =>
      api.put(`/registros/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros"] }),
  });
}

export function useEliminarRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/registros/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros"] }),
  });
}
