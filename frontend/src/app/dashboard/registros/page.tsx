"use client";

import { useState } from "react";
import {
  useRegistros,
  useCrearRegistro,
  useActualizarRegistro,
  useEliminarRegistro,
  type Registro,
} from "@/hooks/useRegistros";
import { formatGuaranies, formatFecha, formatMiles, parseMiles } from "@/lib/format";
import DataTable from "@/components/DataTable";
import AlumnoPicker from "@/components/AlumnoPicker";
import { Plus, Pencil, Trash2, X, Loader2, ClipboardList, Search, FilterX, Download } from "lucide-react";
import { exportToExcel } from "@/lib/export";

export default function RegistrosPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [form, setForm] = useState({
    RegistroTipoRegistro: 0 as number,
    AlumnoId: 0 as number,
    RegistroTipoComprobante: 0 as number,
    RegistroFecha: "",
    RegistroTimbrado: 0,
    RegistroNroComprobante: "",
    RegistroIva10: 0,
    RegistroIva5: 0,
    RegistroIvaExento: 0,
    RegistroTotal: 0,
    RegistroCodigoCondicion: 0 as number,
    RegistroMonedaExtranjera: "N",
    RegistroImputaIva: "N",
    RegistroImputaIre: "N",
    RegistroImputaIrp: "N",
    RegistroComprobanteAsociado: "",
    RegistroTimbradoAsociado: "",
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("RegistroId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: resp, isLoading } = useRegistros({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    tipo: filtroTipo || undefined,
    alumnoId: filtroAlumnoId,
    busqueda: busqueda || undefined,
    page,
    limit: pageSize,
    sortBy,
    sortDir: sortBy ? sortDir : undefined,
  });
  const registros = resp?.data;
  const crear = useCrearRegistro();
  const actualizar = useActualizarRegistro();
  const eliminar = useEliminarRegistro();

  function abrirCrear() {
    setEditando(null);
    setForm({
      RegistroTipoRegistro: 0,
      AlumnoId: 0,
      RegistroTipoComprobante: 0,
      RegistroFecha: "",
      RegistroTimbrado: 0,
      RegistroNroComprobante: "",
      RegistroIva10: 0,
      RegistroIva5: 0,
      RegistroIvaExento: 0,
      RegistroTotal: 0,
      RegistroCodigoCondicion: 0,
      RegistroMonedaExtranjera: "N",
      RegistroImputaIva: "N",
      RegistroImputaIre: "N",
      RegistroImputaIrp: "N",
      RegistroComprobanteAsociado: "",
      RegistroTimbradoAsociado: "",
    });
    setModal(true);
  }

  function abrirEditar(r: Registro) {
    setEditando(r);
    setForm({
      RegistroTipoRegistro: r.RegistroTipoRegistro,
      AlumnoId: r.AlumnoId,
      RegistroTipoComprobante: r.RegistroTipoComprobante,
      RegistroFecha: r.RegistroFecha,
      RegistroTimbrado: r.RegistroTimbrado,
      RegistroNroComprobante: r.RegistroNroComprobante,
      RegistroIva10: r.RegistroIva10,
      RegistroIva5: r.RegistroIva5,
      RegistroIvaExento: r.RegistroIvaExento,
      RegistroTotal: r.RegistroTotal,
      RegistroCodigoCondicion: r.RegistroCodigoCondicion,
      RegistroMonedaExtranjera: r.RegistroMonedaExtranjera,
      RegistroImputaIva: r.RegistroImputaIva,
      RegistroImputaIre: r.RegistroImputaIre,
      RegistroImputaIrp: r.RegistroImputaIrp,
      RegistroComprobanteAsociado: r.RegistroComprobanteAsociado,
      RegistroTimbradoAsociado: r.RegistroTimbradoAsociado,
    });
    setModal(true);
  }

  async function guardar() {
    const data = { ...form, AlumnoId: form.AlumnoId || undefined };
    if (editando) {
      await actualizar.mutateAsync({ id: editando.RegistroId, ...data });
    } else {
      await crear.mutateAsync(data as any);
    }
    setModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Registros</h1>
          <p className="mt-1 text-sm text-gray-500">Registros contables e impositivos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Registro>(
              "/registros",
              { fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined, tipo: filtroTipo || undefined, alumnoId: filtroAlumnoId, busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "Nro", value: (r) => r.RegistroId },
                { header: "Fecha", value: (r) => formatFecha(r.RegistroFecha) },
                { header: "Tipo", value: (r) => r.RegistroTipoRegistro },
                { header: "Nro Comprobante", value: (r) => r.RegistroNroComprobante },
                { header: "IVA 10%", value: (r) => Number(r.RegistroIva10) },
                { header: "IVA 5%", value: (r) => Number(r.RegistroIva5) },
                { header: "IVA Exento", value: (r) => Number(r.RegistroIvaExento) },
                { header: "Total", value: (r) => Number(r.RegistroTotal) },
                { header: "Alumno", value: (r) => r.AlumnoNombre ? `${r.AlumnoNombre} ${r.AlumnoApellido}` : "" },
              ],
              "Registros"
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
            Nuevo Registro
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
          {(fechaDesde || fechaHasta || filtroTipo || filtroAlumnoId) && (
            <button
              onClick={() => { setFechaDesde(""); setFechaHasta(""); setFiltroTipo(""); setFiltroAlumnoId(undefined); setPage(0); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FilterX size={14} />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <label className="mb-1 block text-xs text-gray-500">Tipo de registro</label>
            <input
              placeholder="Tipo de registro..."
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
        data={registros}
        isLoading={isLoading}
        keyExtractor={(r) => r.RegistroId}
        emptyIcon={ClipboardList}
        emptyText="No hay registros para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por comprobante o alumno..."
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
          { header: "Nro", sortKey: "RegistroId", render: (r) => formatMiles(r.RegistroId) },
          { header: "Fecha", sortKey: "RegistroFecha", render: (r) => formatFecha(r.RegistroFecha) },
          { header: "Tipo", sortKey: "RegistroTipoRegistro", render: (r) => r.RegistroTipoRegistro },
          { header: "Nro Comprobante", sortKey: "RegistroNroComprobante", render: (r) => r.RegistroNroComprobante },
          { header: "IVA 10%", render: (r) => formatGuaranies(r.RegistroIva10) },
          { header: "IVA 5%", render: (r) => formatGuaranies(r.RegistroIva5) },
          { header: "Total", sortKey: "RegistroTotal", render: (r) => formatGuaranies(r.RegistroTotal) },
          { header: "Alumno", sortKey: "AlumnoApellido", render: (r) => r.AlumnoNombre ? `${r.AlumnoNombre} ${r.AlumnoApellido}` : "-" },
        ]}
        mobileCard={(r) => (
          <>
            <p className="font-medium text-gray-900">{r.RegistroTipoRegistro}</p>
            <p className="mt-1 text-sm text-gray-500">{formatFecha(r.RegistroFecha)} - {formatGuaranies(r.RegistroTotal)}</p>
            {r.AlumnoNombre && (
              <p className="mt-1 text-sm text-gray-500">{r.AlumnoNombre} {r.AlumnoApellido}</p>
            )}
          </>
        )}
        actions={(r) => (
          <>
            <button onClick={() => abrirEditar(r)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este registro?")) eliminar.mutate(r.RegistroId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
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
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Registro" : "Nuevo Registro"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={form.RegistroFecha}
                  onChange={(e) => setForm({ ...form, RegistroFecha: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Registro</label>
                <input
                  value={form.RegistroTipoRegistro}
                  onChange={(e) => setForm({ ...form, RegistroTipoRegistro: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo Comprobante</label>
                <input
                  value={form.RegistroTipoComprobante}
                  onChange={(e) => setForm({ ...form, RegistroTipoComprobante: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado</label>
                <input
                  type="number"
                  value={form.RegistroTimbrado}
                  onChange={(e) => setForm({ ...form, RegistroTimbrado: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Comprobante</label>
                <input
                  type="number"
                  value={form.RegistroNroComprobante}
                  onChange={(e) => setForm({ ...form, RegistroNroComprobante: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA 10%</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.RegistroIva10)}
                  onChange={(e) => setForm({ ...form, RegistroIva10: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA 5%</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.RegistroIva5)}
                  onChange={(e) => setForm({ ...form, RegistroIva5: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">IVA Exento</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.RegistroIvaExento)}
                  onChange={(e) => setForm({ ...form, RegistroIvaExento: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Total</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMiles(form.RegistroTotal)}
                  onChange={(e) => setForm({ ...form, RegistroTotal: parseMiles(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Codigo Condicion</label>
                <input
                  value={form.RegistroCodigoCondicion}
                  onChange={(e) => setForm({ ...form, RegistroCodigoCondicion: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Moneda Extranjera</label>
                <input
                  value={form.RegistroMonedaExtranjera}
                  onChange={(e) => setForm({ ...form, RegistroMonedaExtranjera: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IVA</label>
                <input
                  value={form.RegistroImputaIva}
                  onChange={(e) => setForm({ ...form, RegistroImputaIva: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IRE</label>
                <input
                  value={form.RegistroImputaIre}
                  onChange={(e) => setForm({ ...form, RegistroImputaIre: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Imputa IRP</label>
                <input
                  value={form.RegistroImputaIrp}
                  onChange={(e) => setForm({ ...form, RegistroImputaIrp: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Comprobante Asociado</label>
                <input
                  value={form.RegistroComprobanteAsociado}
                  onChange={(e) => setForm({ ...form, RegistroComprobanteAsociado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Timbrado Asociado</label>
                <input
                  value={form.RegistroTimbradoAsociado}
                  onChange={(e) => setForm({ ...form, RegistroTimbradoAsociado: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alumno (opcional)</label>
                <AlumnoPicker
                  value={form.AlumnoId}
                  onChange={(id) => setForm({ ...form, AlumnoId: id })}
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
