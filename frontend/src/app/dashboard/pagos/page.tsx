"use client";

import { useState, useRef, useEffect } from "react";
import { usePagos, useCrearPago, useEliminarPago, type Pago } from "@/hooks/usePagos";
import { useEmpleados } from "@/hooks/useEmpleados";
import { useAuth } from "@/lib/auth";
import { formatGuaranies, formatFecha, formatMiles, parseMiles } from "@/lib/format";
import DataTable from "@/components/DataTable";
import { Plus, Trash2, Loader2, Wallet, Search, FilterX, Download, ChevronDown, X } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { confirmarEliminacion, mostrarExito, mostrarError } from "@/lib/swal";

export default function PagosPage() {
  const { usuario } = useAuth();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroEmpleadoId, setFiltroEmpleadoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    PagoEmpleadoFecha: "",
    EmpleadoId: 0,
    PagoEmpleadoEntregaMonto: 0,
    PagoEmpleadoSaldoMonto: 0,
    PagoEmpleadoNroRecibo: 0,
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("PagoEmpleadoFecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: resp, isLoading } = usePagos({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    empleadoId: filtroEmpleadoId,
    busqueda: busqueda || undefined,
    page,
    limit: pageSize,
    sortBy,
    sortDir: sortBy ? sortDir : undefined,
  });
  const pagos = resp?.data;
  const { data: empleadosResp } = useEmpleados({ limit: 100, sortBy: "EmpleadoNombre", sortDir: "asc" });
  const empleados = empleadosResp?.data;
  const crear = useCrearPago();
  const eliminar = useEliminarPago();

  // Combobox empleado en modal
  const [empleadoQuery, setEmpleadoQuery] = useState("");
  const [empleadoOpen, setEmpleadoOpen] = useState(false);
  const empleadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (empleadoRef.current && !empleadoRef.current.contains(e.target as Node)) {
        setEmpleadoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const empleadoSeleccionado = empleados?.find((e) => e.EmpleadoId === form.EmpleadoId);
  const empleadosFiltrados = empleados?.filter((e) => {
    const texto = `${e.EmpleadoNombre} ${e.EmpleadoApellido}`.toLowerCase();
    return texto.includes(empleadoQuery.toLowerCase());
  });

  async function guardar() {
    try {
      await crear.mutateAsync({ ...form, UsuarioId: usuario?.UsuarioId });
      setModal(false);
      mostrarExito("Pago registrado");
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Pagos a Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de pagos realizados a empleados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Pago>(
              "/pagos",
              { fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined, empleadoId: filtroEmpleadoId, busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "Fecha", value: (p) => formatFecha(p.PagoEmpleadoFecha) },
                { header: "Empleado", value: (p) => `${p.EmpleadoNombre} ${p.EmpleadoApellido}` },
                { header: "Monto Entrega", value: (p) => p.PagoEmpleadoEntregaMonto, type: "money" },
                { header: "Monto Saldo", value: (p) => p.PagoEmpleadoSaldoMonto, type: "money" },
              ],
              "Pagos"
            )}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={() => { setForm({ PagoEmpleadoFecha: new Date().toISOString().split("T")[0], EmpleadoId: 0, PagoEmpleadoEntregaMonto: 0, PagoEmpleadoSaldoMonto: 0, PagoEmpleadoNroRecibo: 0 }); setEmpleadoQuery(""); setEmpleadoOpen(false); setModal(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Nuevo Pago
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Search size={16} />
            Filtros
          </div>
          {(fechaDesde || fechaHasta || filtroEmpleadoId) && (
            <button
              onClick={() => { setFechaDesde(""); setFechaHasta(""); setFiltroEmpleadoId(undefined); setPage(0); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FilterX size={14} />
              Limpiar filtros
            </button>
          )}
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

      <DataTable
        data={pagos}
        isLoading={isLoading}
        keyExtractor={(p) => p.PagoEmpleadoId}
        emptyIcon={Wallet}
        emptyText="No hay pagos para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por empleado o CI..."
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
          { header: "Fecha", sortKey: "PagoEmpleadoFecha", render: (p) => formatFecha(p.PagoEmpleadoFecha) },
          { header: "Empleado", sortKey: "EmpleadoApellido", render: (p) => `${p.EmpleadoNombre} ${p.EmpleadoApellido}` },
          { header: "Monto", sortKey: "PagoEmpleadoEntregaMonto", render: (p) => formatGuaranies(p.PagoEmpleadoEntregaMonto) },
        ]}
        mobileCard={(p) => (
          <>
            <p className="font-medium text-gray-900">{p.EmpleadoNombre} {p.EmpleadoApellido}</p>
            <p className="mt-1 text-sm text-gray-500">{formatFecha(p.PagoEmpleadoFecha)}</p>
            <p className="mt-1 text-sm font-medium text-gray-700">{formatGuaranies(p.PagoEmpleadoEntregaMonto)}</p>
          </>
        )}
        actions={(p) => (
          <button onClick={async () => { if (await confirmarEliminacion("este pago")) eliminar.mutate(p.PagoEmpleadoId); }} className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </button>
        )}
      />

      {/* Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Pago</DialogTitle>
          </DialogHeader>
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
            <div ref={empleadoRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Empleado</label>
              {empleadoSeleccionado ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                  <span>{empleadoSeleccionado.EmpleadoNombre} {empleadoSeleccionado.EmpleadoApellido}</span>
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, EmpleadoId: 0 }); setEmpleadoQuery(""); }}
                    className="cursor-pointer rounded p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={empleadoQuery}
                    onChange={(e) => { setEmpleadoQuery(e.target.value); setEmpleadoOpen(true); }}
                    onFocus={() => setEmpleadoOpen(true)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-8 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
              {empleadoOpen && !empleadoSeleccionado && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {empleadosFiltrados?.length ? (
                    empleadosFiltrados.map((e) => (
                      <li
                        key={e.EmpleadoId}
                        onClick={() => { setForm({ ...form, EmpleadoId: e.EmpleadoId }); setEmpleadoOpen(false); setEmpleadoQuery(""); }}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {e.EmpleadoNombre} {e.EmpleadoApellido}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-sm text-gray-400">Sin resultados</li>
                  )}
                </ul>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Monto Entrega</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMiles(form.PagoEmpleadoEntregaMonto)}
                onChange={(e) => setForm({ ...form, PagoEmpleadoEntregaMonto: parseMiles(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Monto Saldo</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMiles(form.PagoEmpleadoSaldoMonto)}
                onChange={(e) => setForm({ ...form, PagoEmpleadoSaldoMonto: parseMiles(e.target.value) })}
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
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={guardar} disabled={crear.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
              {crear.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
