import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Alumno {
  AlumnoId: number;
  CodigoIdentificador: string;
  CI: string;
  Nombre: string;
  Apellido: string;
  CursoId: number;
  Curso?: { Nombre: string };
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
    mutationFn: (data: Omit<Alumno, "AlumnoId" | "Curso">) =>
      api.post("/alumnos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumnos"] }),
  });
}

export function useActualizarAlumno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Alumno> & { id: number }) =>
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
