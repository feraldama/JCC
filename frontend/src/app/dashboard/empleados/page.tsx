"use client";

import { useState } from "react";
import {
  useEmpleados,
  useCrearEmpleado,
  useActualizarEmpleado,
  useEliminarEmpleado,
  type Empleado,
} from "@/hooks/useEmpleados";
import { formatGuaranies, formatMiles, parseMiles } from "@/lib/format";
import { Plus, Pencil, Trash2, X, Loader2, Users, AlertCircle, Download } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import DataTable from "@/components/DataTable";

export default function EmpleadosPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("EmpleadoApellido");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data: resp, isLoading } = useEmpleados({ busqueda: busqueda || undefined, page, limit: pageSize, sortBy, sortDir: sortBy ? sortDir : undefined });
  const empleados = resp?.data;
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

  const [error, setError] = useState("");

  async function guardar() {
    try {
      setError("");
      if (editando) {
        await actualizar.mutateAsync({ id: editando.EmpleadoId, ...form });
      } else {
        await crear.mutateAsync(form);
      }
      setModal(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
      setTimeout(() => setError(""), 5000);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona la informacion de los empleados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Empleado>(
              "/empleados",
              { busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "CI", value: (e) => e.EmpleadoCI },
                { header: "Nombre", value: (e) => e.EmpleadoNombre },
                { header: "Apellido", value: (e) => e.EmpleadoApellido },
                { header: "Monto Cobro", value: (e) => e.EmpleadoCobroMonto },
              ],
              "Empleados"
            )}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={abrirCrear}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Nuevo Empleado
          </button>
        </div>
      </div>

      <DataTable
        data={empleados}
        isLoading={isLoading}
        keyExtractor={(e) => e.EmpleadoId}
        emptyIcon={Users}
        emptyText="No hay empleados para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por nombre, apellido o CI..."
        onSearch={(q) => { setBusqueda(q); setPage(0); }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={(key) => {
          if (sortBy === key) { if (sortDir === "asc") setSortDir("desc"); else { setSortBy(undefined); } }
          else { setSortBy(key); setSortDir("asc"); }
          setPage(0);
        }}
        columns={[
          { header: "CI", sortKey: "EmpleadoCI", render: (e) => e.EmpleadoCI },
          { header: "Nombre", sortKey: "EmpleadoNombre", render: (e) => e.EmpleadoNombre },
          { header: "Apellido", sortKey: "EmpleadoApellido", render: (e) => e.EmpleadoApellido },
          { header: "Monto Cobro", sortKey: "EmpleadoCobroMonto", render: (e) => formatGuaranies(e.EmpleadoCobroMonto) },
        ]}
        mobileCard={(e) => (
          <>
            <p className="font-medium text-gray-900">{e.EmpleadoNombre} {e.EmpleadoApellido}</p>
            <p className="mt-1 text-sm text-gray-500">CI: {e.EmpleadoCI}</p>
            <p className="mt-1 text-sm text-gray-500">{formatGuaranies(e.EmpleadoCobroMonto)}</p>
          </>
        )}
        actions={(e) => (
          <>
            <button onClick={() => abrirEditar(e)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este empleado?")) eliminar.mutate(e.EmpleadoId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
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
            className="relative z-10 max-h-[100vh] sm:max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-10 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
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
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.EmpleadoCobroMonto)}
                  onChange={(e) => setForm({ ...form, EmpleadoCobroMonto: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
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
