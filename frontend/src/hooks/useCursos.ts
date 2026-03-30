import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Curso {
  CursoId: number;
  Nombre: string;
  Importe: number;
}

export function useCursos() {
  return useQuery<Curso[]>({
    queryKey: ["cursos"],
    queryFn: () => api.get("/cursos"),
  });
}

export function useCrearCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Curso, "CursoId">) => api.post("/cursos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

export function useActualizarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Curso> & { id: number }) =>
      api.put(`/cursos/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}

export function useEliminarCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/cursos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cursos"] }),
  });
}
