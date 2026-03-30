import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Alumno {
  AlumnoId: number;
  AlumnoCodigoIdentificador: number;
  AlumnoCI: string;
  AlumnoNombre: string;
  AlumnoApellido: string;
  CursoId: number;
  CursoNombre?: string;
}

interface FiltrosAlumnos {
  nombre?: string;
  ci?: string;
  cursoId?: number;
}

function buildQuery(filtros: FiltrosAlumnos) {
  const params = new URLSearchParams();
  if (filtros.nombre) params.set("nombre", filtros.nombre);
  if (filtros.ci) params.set("ci", filtros.ci);
  if (filtros.cursoId) params.set("cursoId", String(filtros.cursoId));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function useAlumnos(filtros: FiltrosAlumnos = {}) {
  return useQuery<Alumno[]>({
    queryKey: ["alumnos", filtros],
    queryFn: () => api.get(`/alumnos${buildQuery(filtros)}`),
  });
}

export function useCrearAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/alumnos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}

export function useActualizarAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/alumnos/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}

export function useEliminarAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/alumnos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}
