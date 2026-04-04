"use client";

import { useState, useRef, useEffect } from "react";
import {
  usePagosEmpleado,
  useCrearPago,
  useEliminarPago,
  useSiguienteRecibo,
  type Pago,
} from "@/hooks/usePagos";
import { useEmpleados } from "@/hooks/useEmpleados";
import { useAuth } from "@/lib/auth";
import {
  formatGuaranies,
  formatFecha,
  formatMiles,
  parseMiles,
} from "@/lib/format";
import { Trash2, Loader2, FileText, ChevronDown, X } from "lucide-react";
import { confirmarEliminacion, mostrarExito, mostrarError } from "@/lib/swal";
import { generarReciboSalario } from "@/lib/recibo-salario";

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

export default function PagoEmpleadoPage() {
  const { usuario } = useAuth();
  const hoy = new Date();
  const [empleadoId, setEmpleadoId] = useState<number | undefined>();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [fecha, setFecha] = useState(hoy.toISOString().split("T")[0]);
  const [montoPagar, setMontoPagar] = useState(0);

  const { data: empleadosResp } = useEmpleados({
    limit: 1000,
    sortBy: "EmpleadoNombre",
    sortDir: "asc",
  });
  const empleados = empleadosResp?.data;
  const { data: pagosResp, isLoading } = usePagosEmpleado(
    empleadoId,
    mes,
    anio,
  );
  const { data: reciboResp } = useSiguienteRecibo();
  const crear = useCrearPago();
  const eliminar = useEliminarPago();

  // Combobox empleado
  const [empleadoQuery, setEmpleadoQuery] = useState("");
  const [empleadoOpen, setEmpleadoOpen] = useState(false);
  const empleadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        empleadoRef.current &&
        !empleadoRef.current.contains(e.target as Node)
      ) {
        setEmpleadoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const empleadoSeleccionado = empleados?.find(
    (e) => e.EmpleadoId === empleadoId,
  );
  const empleadosFiltrados = empleados?.filter((e) => {
    const texto = `${e.EmpleadoNombre} ${e.EmpleadoApellido}`.toLowerCase();
    return texto.includes(empleadoQuery.toLowerCase());
  });

  const anioActual = hoy.getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);

  async function cargarPago() {
    if (!empleadoId) {
      mostrarError("Seleccione un empleado");
      return;
    }
    if (montoPagar <= 0) {
      mostrarError("Ingrese un monto válido");
      return;
    }
    const saldoActual = pagosResp?.saldoTotal ?? 0;
    if (montoPagar > saldoActual) {
      mostrarError("El monto a pagar no puede ser mayor al saldo pendiente");
      return;
    }

    const nuevoSaldo = saldoActual - montoPagar;
    const nroRecibo = reciboResp?.siguiente ?? 1;

    try {
      await crear.mutateAsync({
        PagoEmpleadoFecha: fecha,
        EmpleadoId: empleadoId,
        PagoEmpleadoEntregaMonto: montoPagar,
        PagoEmpleadoSaldoMonto: nuevoSaldo,
        UsuarioId: usuario?.UsuarioId,
        PagoEmpleadoNroRecibo: nroRecibo,
      });
      // Generar PDF
      generarReciboSalario({
        nroRecibo,
        fecha,
        empleadoNombre: empleadoSeleccionado!.EmpleadoNombre,
        empleadoApellido: empleadoSeleccionado!.EmpleadoApellido,
        empleadoCI: empleadoSeleccionado!.EmpleadoCI,
        mes,
        salarioTotal: pagosResp?.salarioTotal ?? 0,
        descuentos: pagosResp?.totalEntregado ?? 0,
        saldoCobrar: montoPagar,
      });
      setMontoPagar(0);
      mostrarExito("Pago registrado");
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    }
  }

  function reimprimir(pago: Pago) {
    if (!empleadoSeleccionado) return;
    const salario = pagosResp?.salarioTotal ?? 0;
    const entrega = Number(pago.PagoEmpleadoEntregaMonto);
    const saldo = Number(pago.PagoEmpleadoSaldoMonto);
    generarReciboSalario({
      nroRecibo: pago.PagoEmpleadoNroRecibo,
      fecha: pago.PagoEmpleadoFecha,
      empleadoNombre: empleadoSeleccionado.EmpleadoNombre,
      empleadoApellido: empleadoSeleccionado.EmpleadoApellido,
      empleadoCI: empleadoSeleccionado.EmpleadoCI,
      mes,
      salarioTotal: salario,
      descuentos: salario - entrega - saldo,
      saldoCobrar: entrega,
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          Pago a Empleado
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Registrar pagos de salario a empleados
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {/* Seleccion de empleado, mes, anio */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Empleado combobox */}
          <div ref={empleadoRef} className="relative sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Empleado
            </label>
            {empleadoSeleccionado ? (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                <span className="font-medium">
                  {empleadoSeleccionado.EmpleadoNombre}{" "}
                  {empleadoSeleccionado.EmpleadoApellido}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmpleadoId(undefined);
                    setEmpleadoQuery("");
                  }}
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
                  onChange={(e) => {
                    setEmpleadoQuery(e.target.value);
                    setEmpleadoOpen(true);
                  }}
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
                      onClick={() => {
                        setEmpleadoId(e.EmpleadoId);
                        setEmpleadoOpen(false);
                        setEmpleadoQuery("");
                      }}
                      className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {e.EmpleadoNombre} {e.EmpleadoApellido}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400">
                    Sin resultados
                  </li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Mes
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Año
            </label>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info del empleado */}
        {empleadoSeleccionado && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Empleado CI
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-600">
                {formatMiles(Number(empleadoSeleccionado.EmpleadoCI) || 0)}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Salario Mensual
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600">
                {formatGuaranies(empleadoSeleccionado.EmpleadoCobroMonto)}
              </div>
            </div>
          </div>
        )}

        {/* Formulario de pago */}
        {empleadoSeleccionado && (
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Monto a Pagar
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMiles(montoPagar)}
                onChange={(e) => setMontoPagar(parseMiles(e.target.value))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={cargarPago}
              disabled={crear.isPending}
              className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {crear.isPending ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "CARGAR PAGO"
              )}
            </button>
          </div>
        )}

        {/* Tabla de pagos del mes */}
        {empleadoSeleccionado && (
          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        <th className="px-3 py-3">Cobro Id</th>
                        <th className="px-3 py-3">Fecha</th>
                        <th className="px-3 py-3 text-right">Total</th>
                        <th className="px-3 py-3 text-right">Entrega</th>
                        <th className="px-3 py-3 text-right">Saldo</th>
                        <th className="px-3 py-3 text-center">Nro. Recibo</th>
                        <th className="px-3 py-3 text-center">Reimprimir</th>
                        <th className="px-3 py-3 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagosResp?.pagos?.length ? (
                        pagosResp.pagos.map((p) => (
                          <tr
                            key={p.PagoEmpleadoId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-2.5 text-gray-600">
                              {formatMiles(p.PagoEmpleadoId)}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {formatFecha(p.PagoEmpleadoFecha)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {formatMiles(pagosResp.salarioTotal)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {formatMiles(
                                Number(p.PagoEmpleadoEntregaMonto),
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-600">
                              {formatMiles(Number(p.PagoEmpleadoSaldoMonto))}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-600">
                              {formatMiles(p.PagoEmpleadoNroRecibo)}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                onClick={() => reimprimir(p)}
                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Reimprimir recibo"
                              >
                                <FileText size={16} />
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                onClick={async () => {
                                  if (await confirmarEliminacion("este pago"))
                                    eliminar.mutate(p.PagoEmpleadoId);
                                }}
                                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Eliminar pago"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-3 py-8 text-center text-gray-400"
                          >
                            No hay pagos registrados en este mes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 sm:hidden">
                  {pagosResp?.pagos?.length ? (
                    pagosResp.pagos.map((p) => (
                      <div
                        key={p.PagoEmpleadoId}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatFecha(p.PagoEmpleadoFecha)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Recibo Nro. {formatMiles(p.PagoEmpleadoNroRecibo)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => reimprimir(p)}
                              className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if (await confirmarEliminacion("este pago"))
                                  eliminar.mutate(p.PagoEmpleadoId);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Entrega:</span>
                            <span className="ml-1 font-medium">
                              {formatGuaranies(
                                Number(p.PagoEmpleadoEntregaMonto),
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Saldo:</span>
                            <span className="ml-1 font-medium">
                              {formatGuaranies(
                                Number(p.PagoEmpleadoSaldoMonto),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No hay pagos registrados en este mes
                    </p>
                  )}
                </div>

                {/* Totales */}
                <div className="mt-4 flex flex-col items-end gap-2 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-600">
                      Salario Total:
                    </span>
                    <span className="min-w-[120px] text-right font-bold text-gray-900">
                      {formatGuaranies(pagosResp?.salarioTotal ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-600">
                      Total Entregado:
                    </span>
                    <span className="min-w-[120px] text-right font-bold text-green-600">
                      {formatGuaranies(pagosResp?.totalEntregado ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-600">
                      Saldo Pendiente:
                    </span>
                    <span
                      className={`min-w-[120px] text-right font-bold ${(pagosResp?.saldoTotal ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}
                    >
                      {formatGuaranies(pagosResp?.saldoTotal ?? 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
