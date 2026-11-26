"use client";

import { useState } from "react";
import {
  useGratificaciones,
  useGuardarGratificacion,
  useGuardarGratificacionesLote,
  useEliminarGratificacion,
  obtenerGratificacionesDelAnio,
  type GratificacionEmpleado,
} from "@/hooks/useGratificaciones";
import { useAvisoSalida } from "@/hooks/useAvisoSalida";
import { formatFecha, formatGuaranies, formatMiles, parseMiles } from "@/lib/format";
import { exportToExcel } from "@/lib/export";
import { generarReciboGratificacion, generarRecibosGratificacion } from "@/lib/recibo-salario";
import { confirmarEliminacion, mostrarExito, mostrarError } from "@/lib/swal";
import DataTable from "@/components/DataTable";
import { Gift, Printer, Save, Trash2, Loader2, Download } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20";

// Monto tipeado en pantalla y el que estaba guardado cuando se empezó a editar.
// Se guarda el original para poder armar el lote aunque la fila esté en otra página.
interface Edicion {
  monto: number;
  original: number;
}

function montoGuardado(e: GratificacionEmpleado): number {
  return Number(e.GratificacionMonto ?? 0);
}

export default function GratificacionPage() {
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);

  const [anio, setAnio] = useState(anioActual);
  const [fecha, setFecha] = useState(hoy.toISOString().split("T")[0]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [ediciones, setEdiciones] = useState<Record<number, Edicion>>({});
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [imprimiendoTodos, setImprimiendoTodos] = useState(false);

  const { data: resp, isLoading } = useGratificaciones({
    anio,
    busqueda: busqueda || undefined,
    page,
    limit: pageSize,
    sortBy,
    sortDir: sortBy ? sortDir : undefined,
  });
  const guardar = useGuardarGratificacion();
  const guardarLote = useGuardarGratificacionesLote();
  const eliminar = useEliminarGratificacion();

  const pendientes = Object.entries(ediciones)
    .filter(([, ed]) => ed.monto !== ed.original)
    .map(([id, ed]) => ({ EmpleadoId: Number(id), GratificacionMonto: ed.monto }));

  useAvisoSalida(
    pendientes.length > 0,
    "Hay montos de gratificación sin guardar que se van a perder. ¿Salir igual?",
  );

  function montoDe(e: GratificacionEmpleado): number {
    return ediciones[e.EmpleadoId]?.monto ?? montoGuardado(e);
  }

  function estaEditado(e: GratificacionEmpleado): boolean {
    const ed = ediciones[e.EmpleadoId];
    return !!ed && ed.monto !== montoGuardado(e);
  }

  function setMonto(e: GratificacionEmpleado, monto: number) {
    setEdiciones((prev) => ({
      ...prev,
      [e.EmpleadoId]: { monto, original: prev[e.EmpleadoId]?.original ?? montoGuardado(e) },
    }));
  }

  function descartarEdicion(empleadoId: number) {
    setEdiciones(({ [empleadoId]: _, ...resto }) => resto);
  }

  function cambiarAnio(nuevo: number) {
    if (pendientes.length > 0 && !window.confirm("Hay montos sin guardar que se van a perder. ¿Cambiar de año igual?")) {
      return;
    }
    setAnio(nuevo);
    setEdiciones({});
    setPage(0);
  }

  function validarFecha(): boolean {
    if (!fecha) {
      mostrarError("Seleccione la fecha de pago");
      return false;
    }
    return true;
  }

  async function guardarFila(e: GratificacionEmpleado) {
    if (!estaEditado(e)) return;
    const monto = montoDe(e);
    if (monto <= 0) {
      mostrarError("Ingrese un monto mayor a cero. Para quitar la gratificación use Eliminar.");
      return;
    }
    if (!validarFecha()) return;
    setGuardandoId(e.EmpleadoId);
    try {
      await guardar.mutateAsync({
        GratificacionAnio: anio,
        EmpleadoId: e.EmpleadoId,
        GratificacionMonto: monto,
        GratificacionFecha: fecha,
      });
      descartarEdicion(e.EmpleadoId);
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    } finally {
      setGuardandoId(null);
    }
  }

  async function guardarTodos() {
    if (pendientes.length === 0) return;
    if (pendientes.some((p) => p.GratificacionMonto <= 0)) {
      mostrarError("Hay montos vacíos o en cero. Complételos, o use Eliminar para quitar una gratificación.");
      return;
    }
    if (!validarFecha()) return;
    try {
      const r = await guardarLote.mutateAsync({
        GratificacionAnio: anio,
        GratificacionFecha: fecha,
        items: pendientes,
      });
      setEdiciones({});
      mostrarExito(`${r.guardados} gratificaciones guardadas`);
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    }
  }

  function imprimirFila(e: GratificacionEmpleado) {
    if (!e.GratificacionNroRecibo || !e.GratificacionFecha) return;
    generarReciboGratificacion({
      nroRecibo: Number(e.GratificacionNroRecibo),
      fecha: e.GratificacionFecha,
      empleadoNombre: e.EmpleadoNombre,
      empleadoApellido: e.EmpleadoApellido,
      empleadoCI: e.EmpleadoCI,
      anio,
      monto: montoGuardado(e),
    });
  }

  async function imprimirTodos() {
    if (pendientes.length > 0) {
      mostrarError("Hay montos sin guardar. Guárdelos antes de imprimir los recibos.");
      return;
    }
    setImprimiendoTodos(true);
    try {
      const cargados = await obtenerGratificacionesDelAnio(anio);
      if (cargados.length === 0) {
        mostrarError(`No hay gratificaciones cargadas en ${anio}`);
        return;
      }
      generarRecibosGratificacion(
        cargados.map((e) => ({
          nroRecibo: Number(e.GratificacionNroRecibo),
          fecha: e.GratificacionFecha!,
          empleadoNombre: e.EmpleadoNombre,
          empleadoApellido: e.EmpleadoApellido,
          empleadoCI: e.EmpleadoCI,
          anio,
          monto: montoGuardado(e),
        })),
        anio,
      );
    } catch (err: any) {
      mostrarError(err.message || "Error al generar los recibos");
    } finally {
      setImprimiendoTodos(false);
    }
  }

  async function exportar() {
    if (pendientes.length > 0) {
      mostrarError("Hay montos sin guardar. Guárdelos antes de exportar.");
      return;
    }
    try {
      await exportToExcel<GratificacionEmpleado>(
        "/gratificaciones",
        { anio, busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
        [
          { header: "CI", value: (e) => e.EmpleadoCI },
          { header: "Apellido", value: (e) => e.EmpleadoApellido },
          { header: "Nombre", value: (e) => e.EmpleadoNombre },
          { header: "Salario", value: (e) => Number(e.EmpleadoCobroMonto), type: "money" },
          { header: "Gratificación", value: (e) => montoGuardado(e), type: "money" },
          { header: "Nro. Recibo", value: (e) => (e.GratificacionNroRecibo ? Number(e.GratificacionNroRecibo) : "Pendiente") },
          { header: "Fecha Pago", value: (e) => (e.GratificacionFecha ? formatFecha(e.GratificacionFecha) : "") },
        ],
        `Gratificacion_${anio}`,
      );
    } catch (err: any) {
      mostrarError(err.message || "Error al exportar");
    }
  }

  function montoInput(e: GratificacionEmpleado) {
    const salario = Number(e.EmpleadoCobroMonto);
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={montoDe(e) ? formatMiles(montoDe(e)) : ""}
          onChange={(ev) => setMonto(e, parseMiles(ev.target.value))}
          onKeyDown={(ev) => { if (ev.key === "Enter") guardarFila(e); }}
          className={`w-full min-w-[110px] rounded-lg border px-3 py-1.5 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${estaEditado(e) ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}
        />
        <button
          type="button"
          onClick={() => setMonto(e, salario)}
          disabled={!salario}
          title={`Cargar el 100% del salario (${formatGuaranies(salario)})`}
          className="cursor-pointer shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          100%
        </button>
      </div>
    );
  }

  function acciones(e: GratificacionEmpleado) {
    const editado = estaEditado(e);
    return (
      <>
        {editado && (
          <button
            onClick={() => guardarFila(e)}
            disabled={guardandoId === e.EmpleadoId}
            title="Guardar"
            className="cursor-pointer rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
          >
            {guardandoId === e.EmpleadoId ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          </button>
        )}
        {e.GratificacionId && !editado && (
          <button
            onClick={() => imprimirFila(e)}
            title="Imprimir recibo"
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <Printer size={15} />
          </button>
        )}
        {e.GratificacionId && (
          <button
            onClick={async () => {
              if (await confirmarEliminacion("esta gratificación")) {
                eliminar.mutate(e.GratificacionId!, {
                  onSuccess: () => descartarEdicion(e.EmpleadoId),
                  onError: (err: any) => mostrarError(err.message || "Error al eliminar"),
                });
              }
            }}
            title="Eliminar gratificación"
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        )}
      </>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Gratificación</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cargar el monto de gratificación (aguinaldo) de cada empleado e imprimir sus recibos
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={exportar}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={imprimirTodos}
            disabled={imprimiendoTodos}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {imprimiendoTodos ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            Imprimir todos
          </button>
          <button
            onClick={guardarTodos}
            disabled={pendientes.length === 0 || guardarLote.isPending}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardarLote.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar todos{pendientes.length > 0 ? ` (${pendientes.length})` : ""}
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Año</label>
          <select
            value={anio}
            onChange={(e) => cambiarAnio(Number(e.target.value))}
            className={`${inputClass} cursor-pointer`}
          >
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fecha de pago</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
          <p className="text-xs font-medium text-gray-500">Empleados cargados</p>
          <p className="text-lg font-bold text-gray-900">
            {resp?.cantidadCargados ?? 0}
            {!busqueda && resp ? <span className="text-sm font-normal text-gray-500"> de {resp.total}</span> : null}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
          <p className="text-xs font-medium text-gray-500">Total gratificación {anio}</p>
          <p className="text-lg font-bold text-green-600">{formatGuaranies(resp?.totalMonto ?? 0)}</p>
        </div>
      </div>

      {pendientes.length > 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          {pendientes.length === 1 ? "Hay 1 monto sin guardar" : `Hay ${pendientes.length} montos sin guardar`} (resaltados en amarillo).
          Presione Enter en la fila o use &quot;Guardar todos&quot;.
        </p>
      )}

      <DataTable
        data={resp?.data}
        total={resp?.total}
        isLoading={isLoading}
        keyExtractor={(e) => e.EmpleadoId}
        emptyIcon={Gift}
        emptyText="No hay empleados para mostrar"
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
          { header: "CI", sortKey: "EmpleadoCI", render: (e) => formatMiles(Number(e.EmpleadoCI) || 0) },
          { header: "Apellido", sortKey: "EmpleadoApellido", render: (e) => e.EmpleadoApellido },
          { header: "Nombre", sortKey: "EmpleadoNombre", render: (e) => e.EmpleadoNombre },
          { header: "Salario", sortKey: "EmpleadoCobroMonto", render: (e) => formatGuaranies(e.EmpleadoCobroMonto) },
          { header: "Gratificación", sortKey: "GratificacionMonto", render: (e) => montoInput(e) },
          {
            header: "Nro. Recibo",
            sortKey: "GratificacionNroRecibo",
            render: (e) =>
              e.GratificacionNroRecibo ? formatMiles(Number(e.GratificacionNroRecibo)) : <span className="text-gray-400">Pendiente</span>,
          },
        ]}
        mobileCard={(e) => (
          <>
            <p className="font-medium text-gray-900">{e.EmpleadoNombre} {e.EmpleadoApellido}</p>
            <p className="mt-1 text-sm text-gray-500">
              CI: {formatMiles(Number(e.EmpleadoCI) || 0)} · Salario: {formatGuaranies(e.EmpleadoCobroMonto)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {e.GratificacionNroRecibo ? `Recibo Nro. ${formatMiles(Number(e.GratificacionNroRecibo))}` : "Pendiente"}
            </p>
            <div className="mt-2">{montoInput(e)}</div>
          </>
        )}
        actions={acciones}
        scrollMaxHeight={pendientes.length > 0 ? "calc(100vh - 430px)" : "calc(100vh - 370px)"}
      />
    </div>
  );
}
