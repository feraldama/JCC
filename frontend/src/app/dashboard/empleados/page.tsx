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

export default function EmpleadosPage() {
  const { data: empleados, isLoading } = useEmpleados();
  const crear = useCrearEmpleado();
  const actualizar = useActualizarEmpleado();
  const eliminar = useEliminarEmpleado();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState({ CI: "", Nombre: "", Apellido: "", MontoCobro: 0 });

  function abrirCrear() {
    setEditando(null);
    setForm({ CI: "", Nombre: "", Apellido: "", MontoCobro: 0 });
    setModal(true);
  }

  function abrirEditar(e: Empleado) {
    setEditando(e);
    setForm({ CI: e.CI, Nombre: e.Nombre, Apellido: e.Apellido, MontoCobro: e.MontoCobro });
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Empleado
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">CI</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellido</th>
                <th className="px-4 py-3">Monto Cobro</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados?.map((e) => (
                <tr key={e.EmpleadoId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{e.CI}</td>
                  <td className="px-4 py-3">{e.Nombre}</td>
                  <td className="px-4 py-3">{e.Apellido}</td>
                  <td className="px-4 py-3">{formatGuaranies(e.MontoCobro)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(e)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(e.EmpleadoId)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Empleado" : "Nuevo Empleado"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">CI</label>
                <input value={form.CI} onChange={(e) => setForm({ ...form, CI: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                <input value={form.Nombre} onChange={(e) => setForm({ ...form, Nombre: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
                <input value={form.Apellido} onChange={(e) => setForm({ ...form, Apellido: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monto Cobro</label>
                <input type="number" value={form.MontoCobro} onChange={(e) => setForm({ ...form, MontoCobro: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Cancelar</button>
              <button onClick={guardar} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
