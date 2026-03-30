"use client";

import { useState } from "react";
import {
  useRegistros,
  useCrearRegistro,
  useActualizarRegistro,
  useEliminarRegistro,
  type Registro,
} from "@/hooks/useRegistros";
import { useAlumnos } from "@/hooks/useAlumnos";
import { formatGuaranies } from "@/lib/format";
import { Plus, Pencil, Trash2, X, Loader2, ClipboardList, Search } from "lucide-react";

export default function RegistrosPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [form, setForm] = useState({
    RegistroTipoRegistro: 0 as number,
    AlumnoId: 0 as number,
    RegistroTipoComprobante: 0 as number,
    RegistroFecha: "",
    RegistroTimbrado: 0,
    RegistroNroComprobante: "",
    RegistroIva10: 0,
    RegistroIva5: 0,
    RegistroIvaExento: 0,
    RegistroTotal: 0,
    RegistroCodigoCondicion: 0 as number,
    RegistroMonedaExtranjera: "N",
    RegistroImputaIva: "N",
    RegistroImputaIre: "N",
    RegistroImputaIrp: "N",
    RegistroComprobanteAsociado: "",
    RegistroTimbradoAsociado: "",
  });

  const { data: registros, isLoading } = useRegistros({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    tipo: filtroTipo || undefined,
    alumnoId: filtroAlumnoId,
  });
  const { data: alumnos } = useAlumnos();
  const crear = useCrearRegistro();
  const actualizar = useActualizarRegistro();
  const eliminar = useEliminarRegistro();

  function abrirCrear() {
    setEditando(null);
    setForm({
      RegistroTipoRegistro: 0,
      AlumnoId: 0,
      RegistroTipoComprobante: 0,
      RegistroFecha: "",
      RegistroTimbrado: 0,
      RegistroNroComprobante: "",
      RegistroIva10: 0,
      RegistroIva5: 0,
      RegistroIvaExento: 0,
      RegistroTotal: 0,
      RegistroCodigoCondicion: 0,
      RegistroMonedaExtranjera: "N",
      RegistroImputaIva: "N",
      RegistroImputaIre: "N",
      RegistroImputaIrp: "N",
      RegistroComprobanteAsociado: "",
      RegistroTimbradoAsociado: "",
    });
    setModal(true);
  }

  function abrirEditar(r: Registro) {
    setEditando(r);
    setForm({
      RegistroTipoRegistro: r.RegistroTipoRegistro,
      AlumnoId: r.AlumnoId,
      RegistroTipoComprobante: r.RegistroTipoComprobante,
      RegistroFecha: r.RegistroFecha,
      RegistroTimbrado: r.RegistroTimbrado,
      RegistroNroComprobante: r.RegistroNroComprobante,
      RegistroIva10: r.RegistroIva10,
      RegistroIva5: r.RegistroIva5,
      RegistroIvaExento: r.RegistroIvaExento,
      RegistroTotal: r.RegistroTotal,
      RegistroCodigoCondicion: r.RegistroCodigoCondicion,
      RegistroMonedaExtranjera: r.RegistroMonedaExtranjera,
      RegistroImputaIva: r.RegistroImputaIva,
      RegistroImputaIre: r.RegistroImputaIre,
      RegistroImputaIrp: r.RegistroImputaIrp,
      RegistroComprobanteAsociado: r.RegistroComprobanteAsociado,
      RegistroTimbradoAsociado: r.RegistroTimbradoAsociado,
    });
    setModal(true);
  }

  async function guardar() {
    const data = { ...form, AlumnoId: form.AlumnoId || undefined };
    if (editando) {
      await actualizar.mutateAsync({ id: editando.RegistroId, ...data });
    } else {
      await crear.mutateAsync(data as any);
    }
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Registros</h1>
          <p className="mt-1 text-sm text-gray-500">Registros contables e impositivos</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Registro
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <Search size={16} />
          Filtros
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            placeholder="Tipo de registro..."
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
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
      ) : !registros?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <ClipboardList className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay registros para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {registros?.map((r) => (
              <div key={r.RegistroId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{r.RegistroTipoRegistro}</p>
                    <p className="mt-1 text-sm text-gray-500">{r.RegistroFecha} - {formatGuaranies(r.RegistroTotal)}</p>
                    {r.AlumnoNombre && (
                      <p className="mt-1 text-sm text-gray-500">{r.AlumnoNombre} {r.AlumnoApellido}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(r)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => eliminar.mutate(r.RegistroId)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nro Comprobante</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">IVA 10%</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">IVA 5%</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Alumno</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros?.map((r) => (
                  <tr key={r.RegistroId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.RegistroFecha}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.RegistroTipoRegistro}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.RegistroNroComprobante}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(r.RegistroIva10)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(r.RegistroIva5)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(r.RegistroTotal)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{r.AlumnoNombre ? `${r.AlumnoNombre} ${r.AlumnoApellido}` : "-"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(r)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => eliminar.mutate(r.RegistroId)}
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
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Registro" : "Nuevo Registro"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={form.RegistroFecha}
                  onChange={(e) => setForm({ ...form, RegistroFecha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Registro</label>
                <input
                  value={form.RegistroTipoRegistro}
                  onChange={(e) => setForm({ ...form, RegistroTipoRegistro: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo Comprobante</label>
                <input
                  value={form.RegistroTipoComprobante}
                  onChange={(e) => setForm({ ...form, RegistroTipoComprobante: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado</label>
                <input
                  type="number"
                  value={form.RegistroTimbrado}
                  onChange={(e) => setForm({ ...form, RegistroTimbrado: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Comprobante</label>
                <input
                  type="number"
                  value={form.RegistroNroComprobante}
                  onChange={(e) => setForm({ ...form, RegistroNroComprobante: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA 10%</label>
                <input
                  type="number"
                  value={form.RegistroIva10}
                  onChange={(e) => setForm({ ...form, RegistroIva10: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA 5%</label>
                <input
                  type="number"
                  value={form.RegistroIva5}
                  onChange={(e) => setForm({ ...form, RegistroIva5: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA Exento</label>
                <input
                  type="number"
                  value={form.RegistroIvaExento}
                  onChange={(e) => setForm({ ...form, RegistroIvaExento: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Total</label>
                <input
                  type="number"
                  value={form.RegistroTotal}
                  onChange={(e) => setForm({ ...form, RegistroTotal: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Codigo Condicion</label>
                <input
                  value={form.RegistroCodigoCondicion}
                  onChange={(e) => setForm({ ...form, RegistroCodigoCondicion: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Moneda Extranjera</label>
                <input
                  value={form.RegistroMonedaExtranjera}
                  onChange={(e) => setForm({ ...form, RegistroMonedaExtranjera: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IVA</label>
                <input
                  value={form.RegistroImputaIva}
                  onChange={(e) => setForm({ ...form, RegistroImputaIva: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IRE</label>
                <input
                  value={form.RegistroImputaIre}
                  onChange={(e) => setForm({ ...form, RegistroImputaIre: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IRP</label>
                <input
                  value={form.RegistroImputaIrp}
                  onChange={(e) => setForm({ ...form, RegistroImputaIrp: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Comprobante Asociado</label>
                <input
                  value={form.RegistroComprobanteAsociado}
                  onChange={(e) => setForm({ ...form, RegistroComprobanteAsociado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado Asociado</label>
                <input
                  value={form.RegistroTimbradoAsociado}
                  onChange={(e) => setForm({ ...form, RegistroTimbradoAsociado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alumno (opcional)</label>
                <select
                  value={form.AlumnoId ?? ""}
                  onChange={(e) => setForm({ ...form, AlumnoId: Number(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Sin alumno</option>
                  {alumnos?.map((a) => (
                    <option key={a.AlumnoId} value={a.AlumnoId}>{a.AlumnoNombre} {a.AlumnoApellido}</option>
                  ))}
                </select>
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
