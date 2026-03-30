"use client";

import { useState } from "react";
import {
  useEmpleados,
  useCrearEmpleado,
  useActualizarEmpleado,
  useEliminarEmpleado,
  type Empleado,
} from "@/hooks/useEmpleados";
import { formatGuaranies } from "@/lib/format";
import { Plus, Pencil, Trash2, X, Loader2, Users } from "lucide-react";

export default function EmpleadosPage() {
  const { data: empleados, isLoading } = useEmpleados();
  const crear = useCrearEmpleado();
  const actualizar = useActualizarEmpleado();
  const eliminar = useEliminarEmpleado();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState({ EmpleadoCI: "", EmpleadoNombre: "", EmpleadoApellido: "", EmpleadoCobroMonto: 0 });

  function abrirCrear() {
    setEditando(null);
    setForm({ EmpleadoCI: "", EmpleadoNombre: "", EmpleadoApellido: "", EmpleadoCobroMonto: 0 });
    setModal(true);
  }

  function abrirEditar(e: Empleado) {
    setEditando(e);
    setForm({ EmpleadoCI: e.EmpleadoCI, EmpleadoNombre: e.EmpleadoNombre, EmpleadoApellido: e.EmpleadoApellido, EmpleadoCobroMonto: e.EmpleadoCobroMonto });
    setModal(true);
  }

  async function guardar() {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.EmpleadoId, ...form });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona la informacion de los empleados</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Empleado
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !empleados?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay empleados para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {empleados?.map((e) => (
              <div key={e.EmpleadoId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{e.EmpleadoNombre} {e.EmpleadoApellido}</p>
                    <p className="mt-1 text-sm text-gray-500">CI: {e.EmpleadoCI}</p>
                    <p className="mt-1 text-sm text-gray-500">{formatGuaranies(e.EmpleadoCobroMonto)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(e)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => eliminar.mutate(e.EmpleadoId)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">CI</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Apellido</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Monto Cobro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empleados?.map((e) => (
                  <tr key={e.EmpleadoId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{e.EmpleadoCI}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{e.EmpleadoNombre}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{e.EmpleadoApellido}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatGuaranies(e.EmpleadoCobroMonto)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(e)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => eliminar.mutate(e.EmpleadoId)}
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
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Empleado" : "Nuevo Empleado"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">CI</label>
                <input
                  value={form.EmpleadoCI}
                  onChange={(e) => setForm({ ...form, EmpleadoCI: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  value={form.EmpleadoNombre}
                  onChange={(e) => setForm({ ...form, EmpleadoNombre: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  value={form.EmpleadoApellido}
                  onChange={(e) => setForm({ ...form, EmpleadoApellido: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Monto Cobro</label>
                <input
                  type="number"
                  value={form.EmpleadoCobroMonto}
                  onChange={(e) => setForm({ ...form, EmpleadoCobroMonto: Number(e.target.value) })}
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
