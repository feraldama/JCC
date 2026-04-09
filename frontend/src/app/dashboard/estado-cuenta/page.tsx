"use client";

import { useState } from "react";
import { useEstadoCuenta } from "@/hooks/useAlumnos";
import { useCursos, useEstadoCuentaGrado } from "@/hooks/useCursos";
import { formatGuaranies, formatFecha } from "@/lib/format";
import AlumnoPicker from "@/components/AlumnoPicker";
import type { Alumno } from "@/hooks/useAlumnos";
import { ClipboardList, CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import XLSX from "xlsx-js-style";

type Vista = "alumno" | "grado";

const MESES_ABREV: Record<number, string> = {
  2: "FEB", 3: "MAR", 4: "ABR", 5: "MAY", 6: "JUN",
  7: "JUL", 8: "AGO", 9: "SEP", 10: "OCT", 11: "NOV",
};

export default function EstadoCuentaPage() {
  const [vista, setVista] = useState<Vista>("alumno");

  // --- Vista por alumno ---
  const [alumnoId, setAlumnoId] = useState(0);
  const [alumnoLabel, setAlumnoLabel] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const { data, isLoading } = useEstadoCuenta(alumnoId, anio);

  // --- Vista por grado ---
  const [cursoId, setCursoId] = useState(0);
  const [anioGrado, setAnioGrado] = useState(new Date().getFullYear());
  const { data: cursos } = useCursos({ limit: 100 });
  const { data: dataGrado, isLoading: isLoadingGrado } = useEstadoCuentaGrado(cursoId, anioGrado);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function exportarGrado() {
    if (!dataGrado) return;
    const headers = ["Alumno", "CI", ...Object.values(MESES_ABREV), "Pagado", "Pendiente"];
    const rows = dataGrado.alumnos.map((a) => [
      `${a.AlumnoApellido}, ${a.AlumnoNombre}`,
      a.AlumnoCI,
      ...a.meses.map((m) => (m.pagado ? m.monto : 0)),
      a.totalPagado,
      a.totalPendiente,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } as const;
    ws["!cols"] = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length));
      return { wch: Math.min(maxLen + 2, 40) };
    });

    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const addr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[addr]) continue;
        if (row === 0) {
          ws[addr].s = { font: { bold: true }, border, fill: { fgColor: { rgb: "D9E1F2" } }, alignment: { horizontal: "center" } };
        } else if (col >= 2) {
          ws[addr].t = "n";
          ws[addr].v = Number(ws[addr].v) || 0;
          ws[addr].s = { border, numFmt: "#,##0" };
        } else {
          ws[addr].s = { border };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estado de Cuenta");
    XLSX.writeFile(wb, `Estado_Cuenta_${dataGrado.curso.CursoNombre}_${dataGrado.anio}.xlsx`);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Estado de Cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">Consulta de pagos mensuales por alumno o por grado</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setVista("alumno")}
          className={`cursor-pointer flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${vista === "alumno" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Por Alumno
        </button>
        <button
          onClick={() => setVista("grado")}
          className={`cursor-pointer flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${vista === "grado" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Por Grado
        </button>
      </div>

      {/* ===== VISTA POR ALUMNO ===== */}
      {vista === "alumno" && (
        <>
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
        </>
      )}

      {/* ===== VISTA POR GRADO ===== */}
      {vista === "grado" && (
        <>
          {/* Filtros */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Grado / Curso</label>
                <select
                  value={cursoId}
                  onChange={(e) => setCursoId(Number(e.target.value))}
                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={0}>Seleccionar curso...</option>
                  {cursos?.data.map((c) => (
                    <option key={c.CursoId} value={c.CursoId}>{c.CursoNombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Periodo</label>
                <select
                  value={anioGrado}
                  onChange={(e) => setAnioGrado(Number(e.target.value))}
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
          {!cursoId && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
              <ClipboardList className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">Selecciona un grado para ver el estado de cuenta</p>
            </div>
          )}

          {/* Loading */}
          {cursoId > 0 && isLoadingGrado && (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {/* Resultado */}
          {dataGrado && (
            <div className="space-y-6">
              {/* Info del curso + exportar */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 flex-1">
                    <div>
                      <p className="text-xs text-gray-500">Curso</p>
                      <p className="font-medium text-gray-900">{dataGrado.curso.CursoNombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cuota Mensual</p>
                      <p className="font-medium text-gray-900">{formatGuaranies(dataGrado.curso.CursoImporte)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Alumnos</p>
                      <p className="font-medium text-gray-900">{dataGrado.alumnos.length}</p>
                    </div>
                  </div>
                  <button
                    onClick={exportarGrado}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Download size={18} />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Tabla - Desktop */}
              <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-medium text-gray-700">Alumno</th>
                      {Object.entries(MESES_ABREV).map(([num, abrev]) => (
                        <th key={num} className="px-2 py-3 text-center font-medium text-gray-700 whitespace-nowrap">{abrev}</th>
                      ))}
                      <th className="px-3 py-3 text-right font-medium text-emerald-700">Pagado</th>
                      <th className="px-3 py-3 text-right font-medium text-red-700">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataGrado.alumnos.map((a) => (
                      <tr key={a.AlumnoId} className="hover:bg-gray-50">
                        <td className="sticky left-0 bg-white px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {a.AlumnoApellido}, {a.AlumnoNombre}
                        </td>
                        {a.meses.map((m) => (
                          <td key={m.mes} className="px-2 py-3 text-center">
                            {m.pagado ? (
                              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="mx-auto h-5 w-5 text-gray-300" />
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-right text-sm font-medium text-emerald-700">{formatGuaranies(a.totalPagado)}</td>
                        <td className="px-3 py-3 text-right text-sm font-medium text-red-700">{formatGuaranies(a.totalPendiente)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards - Mobile */}
              <div className="space-y-3 sm:hidden">
                {dataGrado.alumnos.map((a) => (
                  <div key={a.AlumnoId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="font-medium text-gray-900">{a.AlumnoApellido}, {a.AlumnoNombre}</p>
                    <p className="mt-0.5 text-xs text-gray-500">CI: {a.AlumnoCI}</p>
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {a.meses.map((m) => (
                        <div
                          key={m.mes}
                          className={`flex flex-col items-center rounded-md px-1 py-1.5 text-[10px] font-medium ${m.pagado ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}`}
                        >
                          {MESES_ABREV[m.mes]}
                          {m.pagado ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 text-gray-300" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between text-xs">
                      <span className="text-emerald-600">Pagado: <span className="font-medium">{formatGuaranies(a.totalPagado)}</span></span>
                      <span className="text-red-600">Pendiente: <span className="font-medium">{formatGuaranies(a.totalPendiente)}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen general */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600">Total Pagado</p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">{formatGuaranies(dataGrado.totalGeneralPagado)}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-xs font-medium text-red-600">Total Pendiente</p>
                    <p className="mt-1 text-lg font-bold text-red-700">{formatGuaranies(dataGrado.totalGeneralPendiente)}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">Total Anual</p>
                    <p className="mt-1 text-lg font-bold text-blue-700">{formatGuaranies(dataGrado.totalGeneralPagado + dataGrado.totalGeneralPendiente)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
