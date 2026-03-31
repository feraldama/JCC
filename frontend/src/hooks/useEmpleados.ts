import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";

export interface Empleado {
  EmpleadoId: number;
  EmpleadoCI: string;
  EmpleadoNombre: string;
  EmpleadoApellido: string;
  EmpleadoCobroMonto: number;
}

export function useEmpleados(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Empleado>>({
    queryKey: ["empleados", filtros],
    queryFn: () => api.get(`/empleados${buildPaginationQuery(filtros)}`),
  });
}

export function useCrearEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/empleados", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empleados"] }),
  });
}

export function useActualizarEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/empleados/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empleados"] }),
  });
}

export function useEliminarEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/empleados/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empleados"] }),
  });
}
