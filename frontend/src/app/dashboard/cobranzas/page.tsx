"use client";

import { useState, useRef, useEffect } from "react";
import { useCobranzas, useCrearCobranza, useEliminarCobranza, useUltimoComprobante } from "@/hooks/useCobranzas";
import { useAuth } from "@/lib/auth";
import { formatGuaranies, formatFecha, formatMiles, parseMiles } from "@/lib/format";
import AlumnoPicker from "@/components/AlumnoPicker";
import DataTable from "@/components/DataTable";
import type { Alumno } from "@/hooks/useAlumnos";
import { Plus, Trash2, X, Loader2, Receipt, Search, FilterX } from "lucide-react";

export default function CobranzasPage() {
  const { usuario } = useAuth();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const fechaRef = useRef<HTMLInputElement>(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [form, setForm] = useState({
    CobranzaFecha: "",
    AlumnoId: 0,
    CobranzaMesPagado: "",
    CobranzaMes: "",
    CobranzaSubtotalCuota: 0,
    CobranzaDiasMora: 0,
    CobranzaExamen: 0,
    CobranzaDescuento: 0,
    CobranzaNroComprobante: 0,
    CobranzaTimbrado: 0,
    CobranzaFebrero: "N",
    CobranzaAdicionalDetalle: "",
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("CobranzaId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: resp, isLoading } = useCobranzas({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    alumnoId: filtroAlumnoId,
    busqueda: busqueda || undefined,
    page,
    limit: pageSize,
    sortBy,
    sortDir: sortBy ? sortDir : undefined,
  });
  const cobranzas = resp?.data;
  const crear = useCrearCobranza();
  const eliminar = useEliminarCobranza();
  const { data: ultimoComprobante } = useUltimoComprobante(modal);

  useEffect(() => {
    if (modal) setTimeout(() => fechaRef.current?.focus(), 50);
  }, [modal]);

  useEffect(() => {
    if (ultimoComprobante && modal) {
      setForm((prev) => ({
        ...prev,
        CobranzaNroComprobante: ultimoComprobante.CobranzaNroComprobante + 1,
        CobranzaTimbrado: ultimoComprobante.CobranzaTimbrado,
      }));
    }
  }, [ultimoComprobante, modal]);

  // Recalcular subtotal cuando cambia mes, febrero o alumno
  useEffect(() => {
    const meses = Number(form.CobranzaMes) || 0;
    const importe = Number(alumnoSeleccionado?.CursoImporte ?? 0);
    let subtotal = meses * importe;
    if (form.CobranzaFebrero === "S") {
      subtotal -= Math.floor(importe / 2);
    }
    setForm((prev) => ({ ...prev, CobranzaSubtotalCuota: subtotal }));
  }, [form.CobranzaMes, form.CobranzaFebrero, alumnoSeleccionado]);

  async function guardar() {
    await crear.mutateAsync({ ...form, UsuarioId: usuario?.UsuarioId });
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Cobranzas</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de cobros mensuales a alumnos</p>
        </div>
        <button
          onClick={() => {
            const hoy = new Date().toISOString().slice(0, 10);
            setForm({ CobranzaFecha: hoy, AlumnoId: 0, CobranzaMesPagado: "", CobranzaMes: "", CobranzaSubtotalCuota: 0, CobranzaDiasMora: 0, CobranzaExamen: 0, CobranzaDescuento: 0, CobranzaNroComprobante: 0, CobranzaTimbrado: 0, CobranzaFebrero: "N", CobranzaAdicionalDetalle: "" });
            setAlumnoSeleccionado(null);
            setModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nueva Cobranza
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Search size={16} />
            Filtros
          </div>
          {(fechaDesde || fechaHasta || filtroAlumnoId) && (
            <button
              onClick={() => { setFechaDesde(""); setFechaHasta(""); setFiltroAlumnoId(undefined); setPage(0); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FilterX size={14} />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Alumno</label>
            <AlumnoPicker
              value={filtroAlumnoId ?? 0}
              onChange={(id) => setFiltroAlumnoId(id || undefined)}
            />
          </div>
        </div>
      </div>

      <DataTable
        data={cobranzas}
        isLoading={isLoading}
        keyExtractor={(c) => c.CobranzaId}
        emptyIcon={Receipt}
        emptyText="No hay cobranzas para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por alumno o CI..."
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
          { header: "Nro", sortKey: "CobranzaId", render: (c) => formatMiles(c.CobranzaId) },
          { header: "Fecha", sortKey: "CobranzaFecha", render: (c) => formatFecha(c.CobranzaFecha) },
          { header: "Nro Comprobante", sortKey: "CobranzaNroComprobante", render: (c) => formatMiles(c.CobranzaNroComprobante) },
          { header: "Alumno", sortKey: "AlumnoApellido", render: (c) => `${c.AlumnoNombre} ${c.AlumnoApellido}` },
          { header: "Curso", sortKey: "CursoNombre", render: (c) => c.CursoNombre },
          { header: "Mes Pagado", sortKey: "CobranzaMes", render: (c) => c.CobranzaMesPagado },
          { header: "Subtotal", sortKey: "CobranzaSubtotalCuota", render: (c) => formatGuaranies(Number(c.CobranzaSubtotalCuota)) },
          { header: "Total", render: (c) => formatGuaranies(Number(c.CobranzaSubtotalCuota) + Number(c.CobranzaExamen) - Number(c.CobranzaDescuento)), className: "px-4 py-3.5 text-sm font-medium text-gray-900" },
        ]}
        mobileCard={(c) => (
          <>
            <p className="font-medium text-gray-900">{c.AlumnoNombre} {c.AlumnoApellido}</p>
            <p className="mt-1 text-sm text-gray-500">{formatFecha(c.CobranzaFecha)} - {c.CobranzaMesPagado}</p>
            <p className="mt-1 text-sm font-medium text-gray-700">Total: {formatGuaranies(Number(c.CobranzaSubtotalCuota) + Number(c.CobranzaExamen) - Number(c.CobranzaDescuento))}</p>
          </>
        )}
        actions={(c) => (
          <button onClick={() => { if (confirm("¿Eliminar esta cobranza?")) eliminar.mutate(c.CobranzaId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </button>
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
              <h2 className="text-lg font-bold text-gray-900">Nueva Cobranza</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  ref={fechaRef}
                  type="date"
                  value={form.CobranzaFecha}
                  onChange={(e) => setForm({ ...form, CobranzaFecha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alumno</label>
                <AlumnoPicker
                  value={form.AlumnoId}
                  onChange={(id) => setForm({ ...form, AlumnoId: id })}
                  onSelect={(alumno) => setAlumnoSeleccionado(alumno)}
                />
              </div>
              {alumnoSeleccionado && (
                <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Curso:</span>
                      <span className="font-medium text-gray-900">{alumnoSeleccionado.CursoNombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Importe Cuota:</span>
                      <span className="font-medium text-gray-900">{formatGuaranies(Number(alumnoSeleccionado.CursoImporte ?? 0))}</span>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mes Pagado</label>
                <input
                  value={form.CobranzaMesPagado}
                  onChange={(e) => setForm({ ...form, CobranzaMesPagado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Mes</label>
                <input
                  value={form.CobranzaMes}
                  onChange={(e) => setForm({ ...form, CobranzaMes: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Subtotal Cuota</label>
                <input
                  type="text"
                  readOnly
                  value={formatGuaranies(form.CobranzaSubtotalCuota)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Comprobante</label>
                <input
                  type="number"
                  value={form.CobranzaNroComprobante}
                  onChange={(e) => setForm({ ...form, CobranzaNroComprobante: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Febrero</label>
                <select
                  value={form.CobranzaFebrero}
                  onChange={(e) => setForm({ ...form, CobranzaFebrero: e.target.value })}
                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="N">NO</option>
                  <option value="S">SI</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Adicional Detalle</label>
                <input
                  value={form.CobranzaAdicionalDetalle}
                  onChange={(e) => setForm({ ...form, CobranzaAdicionalDetalle: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Adicional</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.CobranzaExamen)}
                  onChange={(e) => setForm({ ...form, CobranzaExamen: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-900">{formatGuaranies(form.CobranzaSubtotalCuota + form.CobranzaExamen)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={crear.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
                {crear.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
