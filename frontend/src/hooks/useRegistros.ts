import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Registro {
  RegistroId: number;
  RegistroTipoRegistro: number;
  AlumnoId: number;
  RegistroTipoComprobante: number;
  RegistroFecha: string;
  RegistroTimbrado: number;
  RegistroNroComprobante: string;
  RegistroIva10: number;
  RegistroIva5: number;
  RegistroIvaExento: number;
  RegistroTotal: number;
  RegistroCodigoCondicion: number;
  RegistroMonedaExtranjera: string;
  RegistroImputaIva: string;
  RegistroImputaIre: string;
  RegistroImputaIrp: string;
  RegistroComprobanteAsociado: string;
  RegistroTimbradoAsociado: string;
  AlumnoNombre?: string;
  AlumnoApellido?: string;
  AlumnoCI?: string;
}

interface FiltrosRegistros extends PaginationParams {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
  alumnoId?: number;
}

export function useRegistros(filtros: FiltrosRegistros = {}) {
  return useQuery<PaginatedResponse<Registro>>({
    queryKey: ["registros", filtros],
    queryFn: () => api.get(`/registros${buildPaginationQuery(filtros)}`),
  });
}

export function useCrearRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/registros", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registros"] }),
  });
}

export function useActualizarRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
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
