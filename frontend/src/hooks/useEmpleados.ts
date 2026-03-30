import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Empleado {
  EmpleadoId: number;
  EmpleadoCI: string;
  EmpleadoNombre: string;
  EmpleadoApellido: string;
  EmpleadoCobroMonto: number;
}

export function useEmpleados() {
  return useQuery<Empleado[]>({
    queryKey: ["empleados"],
    queryFn: () => api.get("/empleados"),
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
