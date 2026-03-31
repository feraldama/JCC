import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
  totalAlumnos: number;
  totalEmpleados: number;
  cobranzasMes: { cantidad: number; monto: number };
  registrosMes: number;
  alumnosPorCurso: { nombre: string; cantidad: number }[];
  cobranzasPorMes: { mes: string; cantidad: number; monto: number }[];
  cobranzasRecientes: {
    CobranzaId: number;
    CobranzaFecha: string;
    CobranzaSubtotalCuota: number;
    CobranzaMesPagado: string;
    AlumnoNombre: string;
    AlumnoApellido: string;
  }[];
  alumnosMorosos: {
    CobranzaDiasMora: number;
    CobranzaFecha: string;
    CobranzaSubtotalCuota: number;
    AlumnoNombre: string;
    AlumnoApellido: string;
    AlumnoCI: string;
  }[];
  pagosMes: { cantidad: number; monto: number };
}

export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });
}
