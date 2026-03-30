"use client";

import { useState } from "react";
import { useCobranzas, useCrearCobranza, useEliminarCobranza } from "@/hooks/useCobranzas";
import { useAlumnos } from "@/hooks/useAlumnos";
import { formatGuaranies } from "@/lib/format";

export default function CobranzasPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    Fecha: "",
    AlumnoId: 0,
    MesPagado: "",
    Subtotal: 0,
    Mora: 0,
    Total: 0,
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cobranzas</h1>
        <button
          onClick={() => {
            setForm({ Fecha: "", AlumnoId: 0, MesPagado: "", Subtotal: 0, Mora: 0, Total: 0 });
            setModal(true);
          }}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva Cobranza
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <select value={filtroAlumnoId ?? ""} onChange={(e) => setFiltroAlumnoId(e.target.value ? Number(e.target.value) : undefined)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Todos los alumnos</option>
          {alumnos?.map((a) => (
            <option key={a.AlumnoId} value={a.AlumnoId}>{a.Nombre} {a.Apellido}</option>
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
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Mes Pagado</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">Mora</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cobranzas?.map((c) => (
                <tr key={c.CobranzaId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{c.Fecha}</td>
                  <td className="px-4 py-3">{c.Alumno?.Nombre} {c.Alumno?.Apellido}</td>
                  <td className="px-4 py-3">{c.MesPagado}</td>
                  <td className="px-4 py-3">{formatGuaranies(c.Subtotal)}</td>
                  <td className="px-4 py-3">{formatGuaranies(c.Mora)}</td>
                  <td className="px-4 py-3">{formatGuaranies(c.Total)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => eliminar.mutate(c.CobranzaId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">Nueva Cobranza</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" value={form.Fecha} onChange={(e) => setForm({ ...form, Fecha: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Alumno</label>
                <select value={form.AlumnoId} onChange={(e) => setForm({ ...form, AlumnoId: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value={0}>Seleccionar alumno</option>
                  {alumnos?.map((a) => (
                    <option key={a.AlumnoId} value={a.AlumnoId}>{a.Nombre} {a.Apellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mes Pagado</label>
                <input value={form.MesPagado} onChange={(e) => setForm({ ...form, MesPagado: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subtotal</label>
                <input type="number" value={form.Subtotal} onChange={(e) => setForm({ ...form, Subtotal: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mora</label>
                <input type="number" value={form.Mora} onChange={(e) => setForm({ ...form, Mora: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Total</label>
                <input type="number" value={form.Total} onChange={(e) => setForm({ ...form, Total: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
