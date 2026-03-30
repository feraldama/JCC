"use client";

import { useState } from "react";
import { usePagos, useCrearPago, useEliminarPago } from "@/hooks/usePagos";
import { useEmpleados } from "@/hooks/useEmpleados";
import { formatGuaranies } from "@/lib/format";

export default function PagosPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroEmpleadoId, setFiltroEmpleadoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ Fecha: "", EmpleadoId: 0, Monto: 0 });

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Pagos a Empleados</h1>
        <button
          onClick={() => { setForm({ Fecha: "", EmpleadoId: 0, Monto: 0 }); setModal(true); }}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nuevo Pago
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <select value={filtroEmpleadoId ?? ""} onChange={(e) => setFiltroEmpleadoId(e.target.value ? Number(e.target.value) : undefined)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Todos los empleados</option>
          {empleados?.map((e) => (
            <option key={e.EmpleadoId} value={e.EmpleadoId}>{e.Nombre} {e.Apellido}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos?.map((p) => (
                <tr key={p.PagoId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{p.Fecha}</td>
                  <td className="px-4 py-3">{p.Empleado?.Nombre} {p.Empleado?.Apellido}</td>
                  <td className="px-4 py-3">{formatGuaranies(p.Monto)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => eliminar.mutate(p.PagoId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">Nuevo Pago</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" value={form.Fecha} onChange={(e) => setForm({ ...form, Fecha: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Empleado</label>
                <select value={form.EmpleadoId} onChange={(e) => setForm({ ...form, EmpleadoId: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value={0}>Seleccionar empleado</option>
                  {empleados?.map((e) => (
                    <option key={e.EmpleadoId} value={e.EmpleadoId}>{e.Nombre} {e.Apellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monto</label>
                <input type="number" value={form.Monto} onChange={(e) => setForm({ ...form, Monto: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
