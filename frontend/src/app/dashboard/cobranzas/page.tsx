"use client";

import { useState, useRef, useEffect } from "react";
import { useCobranzas, useCrearCobranza, useAnularCobranza, useUltimoComprobante, type Cobranza } from "@/hooks/useCobranzas";
import { useAuth } from "@/lib/auth";
import { formatGuaranies, formatFecha, formatMiles, parseMiles } from "@/lib/format";
import AlumnoPicker from "@/components/AlumnoPicker";
import DataTable from "@/components/DataTable";
import type { Alumno } from "@/hooks/useAlumnos";
import { Plus, Ban, RotateCcw, Loader2, Receipt, Search, FilterX, Download, Printer } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { confirmarAnulacion, mostrarExito, mostrarError } from "@/lib/swal";
import { imprimirFactura, type FacturaData } from "@/lib/factura-cobranza";

const MESES_CUOTA = [
  { num: 2, nombre: "FEBRERO", abrev: "FEB" },
  { num: 3, nombre: "MARZO", abrev: "MAR" },
  { num: 4, nombre: "ABRIL", abrev: "ABR" },
  { num: 5, nombre: "MAYO", abrev: "MAY" },
  { num: 6, nombre: "JUNIO", abrev: "JUN" },
  { num: 7, nombre: "JULIO", abrev: "JUL" },
  { num: 8, nombre: "AGOSTO", abrev: "AGO" },
  { num: 9, nombre: "SEPTIEMBRE", abrev: "SEP" },
  { num: 10, nombre: "OCTUBRE", abrev: "OCT" },
  { num: 11, nombre: "NOVIEMBRE", abrev: "NOV" },
] as const;


export default function CobranzasPage() {
  const { usuario } = useAuth();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const fechaRef = useRef<HTMLInputElement>(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [mesesSeleccionados, setMesesSeleccionados] = useState<number[]>([]);
  const [form, setForm] = useState({
    CobranzaFecha: "",
    AlumnoId: 0,
    CobranzaMesPagado: "",
    CobranzaMes: 0,
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
  const anular = useAnularCobranza();
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

  // Recalcular subtotal, CobranzaMes, CobranzaMesPagado y CobranzaFebrero desde mesesSeleccionados
  useEffect(() => {
    const importe = Number(alumnoSeleccionado?.CursoImporte ?? 0);
    const tieneFeb = mesesSeleccionados.includes(2);
    const mesesNoFeb = mesesSeleccionados.filter((m) => m !== 2).length;
    const subtotal = mesesNoFeb * importe + (tieneFeb ? Math.floor(importe / 2) : 0);
    setForm((prev) => ({
      ...prev,
      CobranzaMes: mesesSeleccionados.length,
      CobranzaMesPagado: [...mesesSeleccionados].sort((a, b) => a - b).map((n) => MESES_CUOTA.find((m) => m.num === n)!.nombre).join(", "),
      CobranzaFebrero: tieneFeb ? "S" : "N",
      CobranzaSubtotalCuota: subtotal,
    }));
  }, [mesesSeleccionados, alumnoSeleccionado]);

  function imprimirCobranza(c: Cobranza) {
    const esFeb = c.CobranzaFebrero === "S";
    const subtotal = Number(c.CobranzaSubtotalCuota);
    const mesesNoFeb = c.CobranzaMes - (esFeb ? 1 : 0);
    // Calcular importe cuota: subtotal = mesesNoFeb * importe + (esFeb ? importe/2 : 0)
    const importeCuota = mesesNoFeb > 0 ? Math.round(subtotal / (mesesNoFeb + (esFeb ? 0.5 : 0))) : (esFeb ? subtotal * 2 : subtotal);
    const data: FacturaData = {
      nroComprobante: c.CobranzaNroComprobante,
      timbrado: c.CobranzaTimbrado,
      fecha: c.CobranzaFecha,
      alumnoCI: c.AlumnoCI ?? "",
      alumnoNombre: c.AlumnoNombre ?? "",
      alumnoApellido: c.AlumnoApellido ?? "",
      cursoNombre: c.CursoNombre ?? "",
      mesPagado: c.CobranzaMesPagado,
      cantMeses: c.CobranzaMes,
      subtotalCuota: subtotal,
      incluyeFebrero: esFeb,
      importeCuota,
      adicionalDetalle: c.CobranzaAdicionalDetalle,
      adicionalMonto: Number(c.CobranzaExamen),
      descuento: Number(c.CobranzaDescuento),
    };
    imprimirFactura(data);
  }

  async function guardar() {
    try {
      await crear.mutateAsync({ ...form, UsuarioId: usuario?.UsuarioId });
      setModal(false);
      mostrarExito("Cobranza registrada");
      // Imprimir factura con los datos del formulario + alumno seleccionado
      const data: FacturaData = {
        nroComprobante: form.CobranzaNroComprobante,
        timbrado: form.CobranzaTimbrado,
        fecha: form.CobranzaFecha,
        alumnoCI: alumnoSeleccionado?.AlumnoCI ?? "",
        alumnoNombre: alumnoSeleccionado?.AlumnoNombre ?? "",
        alumnoApellido: alumnoSeleccionado?.AlumnoApellido ?? "",
        cursoNombre: alumnoSeleccionado?.CursoNombre ?? "",
        mesPagado: form.CobranzaMesPagado,
        cantMeses: form.CobranzaMes,
        subtotalCuota: form.CobranzaSubtotalCuota,
        incluyeFebrero: form.CobranzaFebrero === "S",
        importeCuota: Number(alumnoSeleccionado?.CursoImporte ?? 0),
        adicionalDetalle: form.CobranzaAdicionalDetalle,
        adicionalMonto: form.CobranzaExamen,
        descuento: form.CobranzaDescuento,
      };
      imprimirFactura(data);
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Cobranzas</h1>
          <p className="mt-1 text-sm text-gray-500">Registro de cobros mensuales a alumnos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Cobranza>(
              "/cobranzas",
              { fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined, alumnoId: filtroAlumnoId, busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "Nro", value: (c) => c.CobranzaId },
                { header: "Fecha", value: (c) => formatFecha(c.CobranzaFecha) },
                { header: "Nro Comprobante", value: (c) => c.CobranzaNroComprobante },
                { header: "Alumno", value: (c) => `${c.AlumnoNombre} ${c.AlumnoApellido}` },
                { header: "Curso", value: (c) => c.CursoNombre ?? "" },
                { header: "Mes Pagado", value: (c) => c.CobranzaMesPagado },
                { header: "Subtotal", value: (c) => Number(c.CobranzaSubtotalCuota), type: "money" },
                { header: "Adicional", value: (c) => Number(c.CobranzaExamen), type: "money" },
                { header: "Descuento", value: (c) => Number(c.CobranzaDescuento), type: "money" },
                { header: "Total", value: (c) => Number(c.CobranzaSubtotalCuota) + Number(c.CobranzaExamen) - Number(c.CobranzaDescuento), type: "money" },
              ],
              "Cobranzas"
            )}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={() => {
              const hoy = new Date().toISOString().slice(0, 10);
              setForm({ CobranzaFecha: hoy, AlumnoId: 0, CobranzaMesPagado: "", CobranzaMes: 0, CobranzaSubtotalCuota: 0, CobranzaDiasMora: 0, CobranzaExamen: 0, CobranzaDescuento: 0, CobranzaNroComprobante: 0, CobranzaTimbrado: 0, CobranzaFebrero: "N", CobranzaAdicionalDetalle: "" });
              setMesesSeleccionados([]);
              setAlumnoSeleccionado(null);
              setModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Nueva Cobranza
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
          { header: "Adicional", sortKey: "CobranzaExamen", render: (c) => formatGuaranies(Number(c.CobranzaExamen)) },
          { header: "Total", render: (c) => formatGuaranies(Number(c.CobranzaSubtotalCuota) + Number(c.CobranzaExamen) - Number(c.CobranzaDescuento)), className: "px-4 py-3.5 text-sm font-medium text-gray-900" },
        ]}
        mobileCard={(c) => (
          <>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{c.AlumnoNombre} {c.AlumnoApellido}</p>
              {c.CobranzaEstado === "X" && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">ANULADO</span>}
            </div>
            <p className="mt-1 text-sm text-gray-500">{formatFecha(c.CobranzaFecha)} - {c.CobranzaMesPagado}</p>
            <p className="mt-1 text-sm font-medium text-gray-700">Total: {formatGuaranies(Number(c.CobranzaSubtotalCuota) + Number(c.CobranzaExamen) - Number(c.CobranzaDescuento))}</p>
          </>
        )}
        actions={(c) => (
          <div className="flex items-center gap-1">
            {c.CobranzaEstado === "X" && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">ANULADO</span>
            )}
            <button onClick={() => imprimirCobranza(c)} className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Imprimir factura">
              <Printer size={15} />
            </button>
            {c.CobranzaEstado !== "X" ? (
              <button onClick={async () => { if (await confirmarAnulacion("esta cobranza")) anular.mutate(c.CobranzaId); }} className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Anular cobranza">
                <Ban size={15} />
              </button>
            ) : (
              <button onClick={() => anular.mutate(c.CobranzaId)} className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600" title="Reactivar cobranza">
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        )}
      />

      {/* Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Cobranza</DialogTitle>
          </DialogHeader>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nro Comprobante</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.CobranzaNroComprobante || ""}
                onChange={(e) => setForm({ ...form, CobranzaNroComprobante: Number(e.target.value.replace(/\D/g, "")) || 0 })}
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
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Meses a Pagar</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {MESES_CUOTA.map((mes) => {
                  const checked = mesesSeleccionados.includes(mes.num);
                  return (
                    <label
                      key={mes.num}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${checked ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setMesesSeleccionados((prev) =>
                            checked ? prev.filter((m) => m !== mes.num) : [...prev, mes.num]
                          );
                        }}
                        className="cursor-pointer accent-blue-600"
                      />
                      {mes.abrev}
                      {mes.num === 2 && <span className="text-[10px] text-blue-500">(50%)</span>}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subtotal Cuota</label>
              <input
                type="text"
                readOnly
                tabIndex={-1}
                value={formatGuaranies(form.CobranzaSubtotalCuota)}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Meses</label>
              <input
                type="text"
                readOnly
                tabIndex={-1}
                value={form.CobranzaMes}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Adicional Detalle</label>
              <input
                value={form.CobranzaAdicionalDetalle}
                onChange={(e) => setForm({ ...form, CobranzaAdicionalDetalle: e.target.value.toUpperCase() })}
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
