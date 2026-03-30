"use client";

import { useState } from "react";
import {
  useRegistros,
  useCrearRegistro,
  useActualizarRegistro,
  useEliminarRegistro,
  type Registro,
} from "@/hooks/useRegistros";
import { useAlumnos } from "@/hooks/useAlumnos";
import { formatGuaranies } from "@/lib/format";

export default function RegistrosPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<number | undefined>();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [form, setForm] = useState({
    Fecha: "",
    TipoRegistro: "",
    Descripcion: "",
    Monto: 0,
    AlumnoId: undefined as number | undefined,
  });

  const { data: registros, isLoading } = useRegistros({
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    tipoRegistro: filtroTipo || undefined,
    alumnoId: filtroAlumnoId,
  });
  const { data: alumnos } = useAlumnos();
  const crear = useCrearRegistro();
  const actualizar = useActualizarRegistro();
  const eliminar = useEliminarRegistro();

  function abrirCrear() {
    setEditando(null);
    setForm({ Fecha: "", TipoRegistro: "", Descripcion: "", Monto: 0, AlumnoId: undefined });
    setModal(true);
  }

  function abrirEditar(r: Registro) {
    setEditando(r);
    setForm({
      Fecha: r.Fecha,
      TipoRegistro: r.TipoRegistro,
      Descripcion: r.Descripcion,
      Monto: r.Monto,
      AlumnoId: r.AlumnoId,
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Registros</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Registro
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input placeholder="Tipo de registro..." value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descripcion</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros?.map((r) => (
                <tr key={r.RegistroId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{r.Fecha}</td>
                  <td className="px-4 py-3">{r.TipoRegistro}</td>
                  <td className="px-4 py-3">{r.Descripcion}</td>
                  <td className="px-4 py-3">{formatGuaranies(r.Monto)}</td>
                  <td className="px-4 py-3">{r.Alumno ? `${r.Alumno.Nombre} ${r.Alumno.Apellido}` : "-"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(r)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(r.RegistroId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Registro" : "Nuevo Registro"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" value={form.Fecha} onChange={(e) => setForm({ ...form, Fecha: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de Registro</label>
                <input value={form.TipoRegistro} onChange={(e) => setForm({ ...form, TipoRegistro: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripcion</label>
                <input value={form.Descripcion} onChange={(e) => setForm({ ...form, Descripcion: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monto</label>
                <input type="number" value={form.Monto} onChange={(e) => setForm({ ...form, Monto: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Alumno (opcional)</label>
                <select value={form.AlumnoId ?? ""} onChange={(e) => setForm({ ...form, AlumnoId: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">Sin alumno</option>
                  {alumnos?.map((a) => (
                    <option key={a.AlumnoId} value={a.AlumnoId}>{a.Nombre} {a.Apellido}</option>
                  ))}
                </select>
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
