"use client";

import { useState } from "react";
import {
  useFacturas,
  useCrearFactura,
  useActualizarFactura,
  useEliminarFactura,
  type Factura,
} from "@/hooks/useFacturas";
import { Plus, Pencil, Trash2, X, Loader2, FileText } from "lucide-react";
import DataTable from "@/components/DataTable";

export default function FacturasPage() {
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const { data: resp, isLoading } = useFacturas({ busqueda: busqueda || undefined, page, limit: 10 });
  const facturas = resp?.data;
  const crear = useCrearFactura();
  const actualizar = useActualizarFactura();
  const eliminar = useEliminarFactura();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Factura | null>(null);
  const [form, setForm] = useState({ FacturaTimbrado: 0, FacturaDesde: 0, FacturaHasta: 0 });

  function abrirCrear() {
    setEditando(null);
    setForm({ FacturaTimbrado: 0, FacturaDesde: 0, FacturaHasta: 0 });
    setModal(true);
  }

  function abrirEditar(f: Factura) {
    setEditando(f);
    setForm({ FacturaTimbrado: f.FacturaTimbrado, FacturaDesde: f.FacturaDesde, FacturaHasta: f.FacturaHasta });
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Facturas / Talonarios</h1>
          <p className="mt-1 text-sm text-gray-500">Control de talonarios y numeracion de facturas</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Talonario
        </button>
      </div>

      <DataTable
        data={facturas}
        isLoading={isLoading}
        keyExtractor={(f) => f.FacturaId}
        emptyIcon={FileText}
        emptyText="No hay talonarios para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por timbrado..."
        onSearch={(q) => { setBusqueda(q); setPage(0); }}
        page={page}
        onPageChange={setPage}
        columns={[
          { header: "Timbrado", render: (f) => f.FacturaTimbrado },
          { header: "Desde", render: (f) => f.FacturaDesde },
          { header: "Hasta", render: (f) => f.FacturaHasta },
        ]}
        mobileCard={(f) => (
          <>
            <p className="font-medium text-gray-900">Timbrado: {f.FacturaTimbrado}</p>
            <p className="mt-1 text-sm text-gray-500">Desde: {f.FacturaDesde} - Hasta: {f.FacturaHasta}</p>
          </>
        )}
        actions={(f) => (
          <>
            <button onClick={() => abrirEditar(f)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este talonario?")) eliminar.mutate(f.FacturaId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Talonario" : "Nuevo Talonario"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado</label>
                <input
                  type="number"
                  value={form.FacturaTimbrado}
                  onChange={(e) => setForm({ ...form, FacturaTimbrado: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Numero Desde</label>
                <input
                  type="number"
                  value={form.FacturaDesde}
                  onChange={(e) => setForm({ ...form, FacturaDesde: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Numero Hasta</label>
                <input
                  type="number"
                  value={form.FacturaHasta}
                  onChange={(e) => setForm({ ...form, FacturaHasta: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={crear.isPending || actualizar.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
                {crear.isPending || actualizar.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
