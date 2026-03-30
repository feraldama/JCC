"use client";

import { useState } from "react";
import { useCobranzas, useCrearCobranza, useEliminarCobranza } from "@/hooks/useCobranzas";
import { useAlumnos } from "@/hooks/useAlumnos";
import { formatGuaranies } from "@/lib/format";
import { Plus, Trash2, X, Loader2, Receipt, Search } from "lucide-react";

export default function CobranzasPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    CobranzaFecha: "",
    AlumnoId: 0,
    CobranzaMesPagado: "",
    CobranzaMes: "",
    CobranzaSubtotalCuota: 0,
    CobranzaDiasMora: 0,
    CobranzaExamen: 0,
    CobranzaDescuento: 0,
    UsuarioId: 0,
    CobranzaNroComprobante: 0,
    CobranzaTimbrado: 0,
    CobranzaFebrero: 0,
    CobranzaAdicionalDetalle: "",
  });

  const { data: cobranzas, isLoading } = useCobranzas({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    alumnoId: filtroAlumnoId,
  });
  const { data: alumnos } = useAlumnos();
  const crear = useCrearCobranza();
  const eliminar = useEliminarCobranza();

  async function guardar() {
    await crear.mutateAsync(form);
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Cobranzas</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de cobros mensuales a alumnos</p>
        </div>
        <button
          onClick={() => {
            setForm({ CobranzaFecha: "", AlumnoId: 0, CobranzaMesPagado: "", CobranzaMes: "", CobranzaSubtotalCuota: 0, CobranzaDiasMora: 0, CobranzaExamen: 0, CobranzaDescuento: 0, UsuarioId: 0, CobranzaNroComprobante: 0, CobranzaTimbrado: 0, CobranzaFebrero: 0, CobranzaAdicionalDetalle: "" });
            setModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nueva Cobranza
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <Search size={16} />
          Filtros
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            placeholder="Fecha desde"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            placeholder="Fecha hasta"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={filtroAlumnoId ?? ""}
            onChange={(e) => setFiltroAlumnoId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los alumnos</option>
            {alumnos?.map((a) => (
              <option key={a.AlumnoId} value={a.AlumnoId}>{a.AlumnoNombre} {a.AlumnoApellido}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !cobranzas?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <Receipt className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay cobranzas para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {cobranzas?.map((c) => (
              <div key={c.CobranzaId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.AlumnoNombre} {c.AlumnoApellido}</p>
                    <p className="mt-1 text-sm text-gray-500">{c.CobranzaFecha} - {c.CobranzaMesPagado}</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">Total: {formatGuaranies(c.CobranzaSubtotalCuota + c.CobranzaExamen - c.CobranzaDescuento)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => eliminar.mutate(c.CobranzaId)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - tabla */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Alumno</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Mes Pagado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Subtotal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dias Mora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cobranzas?.map((c) => (
                  <tr key={c.CobranzaId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{c.CobranzaFecha}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{c.AlumnoNombre} {c.AlumnoApellido}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{c.CobranzaMesPagado}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(c.CobranzaSubtotalCuota)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{c.CobranzaDiasMora}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{formatGuaranies(c.CobranzaSubtotalCuota + c.CobranzaExamen - c.CobranzaDescuento)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => eliminar.mutate(c.CobranzaId)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Nueva Cobranza</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={form.CobranzaFecha}
                  onChange={(e) => setForm({ ...form, CobranzaFecha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alumno</label>
                <select
                  value={form.AlumnoId}
                  onChange={(e) => setForm({ ...form, AlumnoId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={0}>Seleccionar alumno</option>
                  {alumnos?.map((a) => (
                    <option key={a.AlumnoId} value={a.AlumnoId}>{a.AlumnoNombre} {a.AlumnoApellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mes Pagado</label>
                <input
                  value={form.CobranzaMesPagado}
                  onChange={(e) => setForm({ ...form, CobranzaMesPagado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mes</label>
                <input
                  value={form.CobranzaMes}
                  onChange={(e) => setForm({ ...form, CobranzaMes: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Subtotal Cuota</label>
                <input
                  type="number"
                  value={form.CobranzaSubtotalCuota}
                  onChange={(e) => setForm({ ...form, CobranzaSubtotalCuota: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Dias Mora</label>
                <input
                  type="number"
                  value={form.CobranzaDiasMora}
                  onChange={(e) => setForm({ ...form, CobranzaDiasMora: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Examen</label>
                <input
                  type="number"
                  value={form.CobranzaExamen}
                  onChange={(e) => setForm({ ...form, CobranzaExamen: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Descuento</label>
                <input
                  type="number"
                  value={form.CobranzaDescuento}
                  onChange={(e) => setForm({ ...form, CobranzaDescuento: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Usuario ID</label>
                <input
                  type="number"
                  value={form.UsuarioId}
                  onChange={(e) => setForm({ ...form, UsuarioId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Comprobante</label>
                <input
                  type="number"
                  value={form.CobranzaNroComprobante}
                  onChange={(e) => setForm({ ...form, CobranzaNroComprobante: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado</label>
                <input
                  type="number"
                  value={form.CobranzaTimbrado}
                  onChange={(e) => setForm({ ...form, CobranzaTimbrado: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Febrero</label>
                <input
                  type="number"
                  value={form.CobranzaFebrero}
                  onChange={(e) => setForm({ ...form, CobranzaFebrero: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Adicional Detalle</label>
                <input
                  value={form.CobranzaAdicionalDetalle}
                  onChange={(e) => setForm({ ...form, CobranzaAdicionalDetalle: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
