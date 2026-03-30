"use client";

import { useState } from "react";
import {
  useCursos,
  useCrearCurso,
  useActualizarCurso,
  useEliminarCurso,
  type Curso,
} from "@/hooks/useCursos";
import { formatGuaranies } from "@/lib/format";

export default function CursosPage() {
  const { data: cursos, isLoading } = useCursos();
  const crear = useCrearCurso();
  const actualizar = useActualizarCurso();
  const eliminar = useEliminarCurso();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [form, setForm] = useState({ Nombre: "", Importe: 0 });

  function abrirCrear() {
    setEditando(null);
    setForm({ Nombre: "", Importe: 0 });
    setModal(true);
  }

  function abrirEditar(c: Curso) {
    setEditando(c);
    setForm({ Nombre: c.Nombre, Importe: c.Importe });
    setModal(true);
  }

  async function guardar() {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.CursoId, ...form });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cursos</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Curso
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Importe</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos?.map((c) => (
                <tr key={c.CursoId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{c.Nombre}</td>
                  <td className="px-4 py-3">{formatGuaranies(c.Importe)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(c)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(c.CursoId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Curso" : "Nuevo Curso"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                <input value={form.Nombre} onChange={(e) => setForm({ ...form, Nombre: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Importe</label>
                <input type="number" value={form.Importe} onChange={(e) => setForm({ ...form, Importe: Number(e.target.value) })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
