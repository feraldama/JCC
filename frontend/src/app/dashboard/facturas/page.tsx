"use client";

import { useState } from "react";
import {
  useFacturas,
  useCrearFactura,
  useActualizarFactura,
  useEliminarFactura,
  type Factura,
} from "@/hooks/useFacturas";

export default function FacturasPage() {
  const { data: facturas, isLoading } = useFacturas();
  const crear = useCrearFactura();
  const actualizar = useActualizarFactura();
  const eliminar = useEliminarFactura();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Factura | null>(null);
  const [form, setForm] = useState({ Timbrado: "", NumeroDesde: 0, NumeroHasta: 0 });

  function abrirCrear() {
    setEditando(null);
    setForm({ Timbrado: "", NumeroDesde: 0, NumeroHasta: 0 });
    setModal(true);
  }

  function abrirEditar(f: Factura) {
    setEditando(f);
    setForm({ Timbrado: f.Timbrado, NumeroDesde: f.NumeroDesde, NumeroHasta: f.NumeroHasta });
    setModal(true);
  }

  async function guardar() {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.FacturaId, ...form });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Facturas / Talonarios</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Talonario
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Timbrado</th>
                <th className="px-4 py-3">Desde</th>
                <th className="px-4 py-3">Hasta</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas?.map((f) => (
                <tr key={f.FacturaId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{f.Timbrado}</td>
                  <td className="px-4 py-3">{f.NumeroDesde}</td>
                  <td className="px-4 py-3">{f.NumeroHasta}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(f)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(f.FacturaId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Talonario" : "Nuevo Talonario"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Timbrado</label>
                <input value={form.Timbrado} onChange={(e) => setForm({ ...form, Timbrado: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Numero Desde</label>
                <input type="number" value={form.NumeroDesde} onChange={(e) => setForm({ ...form, NumeroDesde: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Numero Hasta</label>
                <input type="number" value={form.NumeroHasta} onChange={(e) => setForm({ ...form, NumeroHasta: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
