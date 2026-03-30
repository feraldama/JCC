"use client";

import { useState } from "react";
import { usePagos, useCrearPago, useEliminarPago } from "@/hooks/usePagos";
import { useEmpleados } from "@/hooks/useEmpleados";
import { formatGuaranies } from "@/lib/format";
import { Plus, Trash2, X, Loader2, Wallet, Search } from "lucide-react";

export default function PagosPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroEmpleadoId, setFiltroEmpleadoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    PagoEmpleadoFecha: "",
    EmpleadoId: 0,
    PagoEmpleadoEntregaMonto: 0,
    PagoEmpleadoSaldoMonto: 0,
    UsuarioId: 0,
    PagoEmpleadoNroRecibo: 0,
  });

  const { data: pagos, isLoading } = usePagos({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    empleadoId: filtroEmpleadoId,
  });
  const { data: empleados } = useEmpleados();
  const crear = useCrearPago();
  const eliminar = useEliminarPago();

  async function guardar() {
    await crear.mutateAsync(form);
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Pagos a Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de pagos realizados a empleados</p>
        </div>
        <button
          onClick={() => { setForm({ PagoEmpleadoFecha: "", EmpleadoId: 0, PagoEmpleadoEntregaMonto: 0, PagoEmpleadoSaldoMonto: 0, UsuarioId: 0, PagoEmpleadoNroRecibo: 0 }); setModal(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Pago
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
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={filtroEmpleadoId ?? ""}
            onChange={(e) => setFiltroEmpleadoId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los empleados</option>
            {empleados?.map((e) => (
              <option key={e.EmpleadoId} value={e.EmpleadoId}>{e.EmpleadoNombre} {e.EmpleadoApellido}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !pagos?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <Wallet className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay pagos para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {pagos?.map((p) => (
              <div key={p.PagoEmpleadoId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.EmpleadoNombre} {p.EmpleadoApellido}</p>
                    <p className="mt-1 text-sm text-gray-500">{p.PagoEmpleadoFecha}</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">{formatGuaranies(p.PagoEmpleadoEntregaMonto)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => eliminar.mutate(p.PagoEmpleadoId)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos?.map((p) => (
                  <tr key={p.PagoEmpleadoId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{p.PagoEmpleadoFecha}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{p.EmpleadoNombre} {p.EmpleadoApellido}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(p.PagoEmpleadoEntregaMonto)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => eliminar.mutate(p.PagoEmpleadoId)}
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
              <h2 className="text-lg font-bold text-gray-900">Nuevo Pago</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={form.PagoEmpleadoFecha}
                  onChange={(e) => setForm({ ...form, PagoEmpleadoFecha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Empleado</label>
                <select
                  value={form.EmpleadoId}
                  onChange={(e) => setForm({ ...form, EmpleadoId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={0}>Seleccionar empleado</option>
                  {empleados?.map((e) => (
                    <option key={e.EmpleadoId} value={e.EmpleadoId}>{e.EmpleadoNombre} {e.EmpleadoApellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Monto Entrega</label>
                <input
                  type="number"
                  value={form.PagoEmpleadoEntregaMonto}
                  onChange={(e) => setForm({ ...form, PagoEmpleadoEntregaMonto: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Monto Saldo</label>
                <input
                  type="number"
                  value={form.PagoEmpleadoSaldoMonto}
                  onChange={(e) => setForm({ ...form, PagoEmpleadoSaldoMonto: Number(e.target.value) })}
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Recibo</label>
                <input
                  type="number"
                  value={form.PagoEmpleadoNroRecibo}
                  onChange={(e) => setForm({ ...form, PagoEmpleadoNroRecibo: Number(e.target.value) })}
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
