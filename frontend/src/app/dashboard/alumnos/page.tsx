"use client";

import { useState } from "react";
import {
  useAlumnos,
  useCrearAlumno,
  useActualizarAlumno,
  useEliminarAlumno,
  type Alumno,
} from "@/hooks/useAlumnos";
import { useCursos } from "@/hooks/useCursos";

export default function AlumnosPage() {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCI, setFiltroCI] = useState("");
  const [filtroCursoId, setFiltroCursoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Alumno | null>(null);
  const [form, setForm] = useState({
    CodigoIdentificador: "",
    CI: "",
    Nombre: "",
    Apellido: "",
    CursoId: 0,
  });

  const { data: alumnos, isLoading } = useAlumnos({
    nombre: filtroNombre || undefined,
    ci: filtroCI || undefined,
    cursoId: filtroCursoId,
  });
  const { data: cursos } = useCursos();
  const crear = useCrearAlumno();
  const actualizar = useActualizarAlumno();
  const eliminar = useEliminarAlumno();

  function abrirCrear() {
    setEditando(null);
    setForm({ CodigoIdentificador: "", CI: "", Nombre: "", Apellido: "", CursoId: 0 });
    setModal(true);
  }

  function abrirEditar(a: Alumno) {
    setEditando(a);
    setForm({
      CodigoIdentificador: a.CodigoIdentificador,
      CI: a.CI,
      Nombre: a.Nombre,
      Apellido: a.Apellido,
      CursoId: a.CursoId,
    });
    setModal(true);
  }

  async function guardar() {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.AlumnoId, ...form });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Alumnos</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Alumno
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Buscar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <input
          placeholder="Buscar por CI..."
          value={filtroCI}
          onChange={(e) => setFiltroCI(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={filtroCursoId ?? ""}
          onChange={(e) => setFiltroCursoId(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Todos los cursos</option>
          {cursos?.map((c) => (
            <option key={c.CursoId} value={c.CursoId}>{c.Nombre}</option>
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
                <th className="px-4 py-3">Codigo</th>
                <th className="px-4 py-3">CI</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellido</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos?.map((a) => (
                <tr key={a.AlumnoId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{a.CodigoIdentificador}</td>
                  <td className="px-4 py-3">{a.CI}</td>
                  <td className="px-4 py-3">{a.Nombre}</td>
                  <td className="px-4 py-3">{a.Apellido}</td>
                  <td className="px-4 py-3">{a.Curso?.Nombre}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(a)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(a.AlumnoId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Alumno" : "Nuevo Alumno"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Codigo Identificador</label>
                <input value={form.CodigoIdentificador} onChange={(e) => setForm({ ...form, CodigoIdentificador: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">CI</label>
                <input value={form.CI} onChange={(e) => setForm({ ...form, CI: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                <input value={form.Nombre} onChange={(e) => setForm({ ...form, Nombre: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Apellido</label>
                <input value={form.Apellido} onChange={(e) => setForm({ ...form, Apellido: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Curso</label>
                <select value={form.CursoId} onChange={(e) => setForm({ ...form, CursoId: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value={0}>Seleccionar curso</option>
                  {cursos?.map((c) => (
                    <option key={c.CursoId} value={c.CursoId}>{c.Nombre}</option>
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
