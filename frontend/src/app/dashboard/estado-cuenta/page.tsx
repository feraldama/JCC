"use client";

import { useState } from "react";
import { useEstadoCuenta } from "@/hooks/useAlumnos";
import { formatGuaranies, formatFecha } from "@/lib/format";
import AlumnoPicker from "@/components/AlumnoPicker";
import type { Alumno } from "@/hooks/useAlumnos";
import { ClipboardList, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function EstadoCuentaPage() {
  const [alumnoId, setAlumnoId] = useState(0);
  const [alumnoLabel, setAlumnoLabel] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const { data, isLoading } = useEstadoCuenta(alumnoId, anio);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Estado de Cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">Consulta de pagos mensuales por alumno</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Alumno</label>
            <AlumnoPicker
              value={alumnoId}
              onChange={(id) => setAlumnoId(id)}
              onSelect={(a: Alumno | null) => setAlumnoLabel(a ? `${a.AlumnoApellido}, ${a.AlumnoNombre}` : "")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Periodo</label>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estado vacío */}
      {!alumnoId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <ClipboardList className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">Selecciona un alumno para ver su estado de cuenta</p>
        </div>
      )}

      {/* Loading */}
      {alumnoId > 0 && isLoading && (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Resultado */}
      {data && (
        <div className="space-y-6">
          {/* Info del alumno */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Alumno</p>
                <p className="font-medium text-gray-900">{data.alumno.AlumnoNombre} {data.alumno.AlumnoApellido}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Curso</p>
                <p className="font-medium text-gray-900">{data.alumno.CursoNombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cuota Mensual</p>
                <p className="font-medium text-gray-900">{formatGuaranies(data.alumno.CursoImporte)}</p>
              </div>
            </div>
          </div>

          {/* Grilla de meses - Desktop */}
          <div className="hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
            <div className="grid grid-cols-5 gap-px bg-gray-200">
              {data.meses.map((m) => (
                <div
                  key={m.mes}
                  className={`flex flex-col items-center gap-2 p-4 ${m.pagado ? "bg-emerald-50" : "bg-white"}`}
                >
                  <span className={`text-xs font-semibold uppercase ${m.pagado ? "text-emerald-700" : "text-gray-500"}`}>
                    {m.nombre}
                  </span>
                  {m.pagado ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-300" />
                  )}
                  <span className={`text-sm font-medium ${m.pagado ? "text-emerald-700" : "text-gray-700"}`}>
                    {formatGuaranies(m.monto)}
                  </span>
                  {m.pagado && m.fecha && (
                    <span className="text-[11px] text-emerald-600">{formatFecha(m.fecha)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grilla de meses - Mobile */}
          <div className="space-y-2 sm:hidden">
            {data.meses.map((m) => (
              <div
                key={m.mes}
                className={`flex items-center justify-between rounded-lg border p-3 ${m.pagado ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}
              >
                <div className="flex items-center gap-3">
                  {m.pagado ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${m.pagado ? "text-emerald-700" : "text-gray-700"}`}>{m.nombre}</p>
                    {m.pagado && m.fecha && (
                      <p className="text-xs text-emerald-600">{formatFecha(m.fecha)}</p>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${m.pagado ? "text-emerald-700" : "text-gray-700"}`}>
                  {formatGuaranies(m.monto)}
                </span>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-600">Total Pagado</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{formatGuaranies(data.totalPagado)}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-xs font-medium text-red-600">Total Pendiente</p>
                <p className="mt-1 text-lg font-bold text-red-700">{formatGuaranies(data.totalPendiente)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-600">Total Anual</p>
                <p className="mt-1 text-lg font-bold text-blue-700">{formatGuaranies(data.totalPagado + data.totalPendiente)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
