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
import { Plus, Pencil, Trash2, X, Loader2, GraduationCap, Search } from "lucide-react";

export default function AlumnosPage() {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCI, setFiltroCI] = useState("");
  const [filtroCursoId, setFiltroCursoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Alumno | null>(null);
  const [form, setForm] = useState({
    AlumnoCodigoIdentificador: 0,
    AlumnoCI: "",
    AlumnoNombre: "",
    AlumnoApellido: "",
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
    setForm({ AlumnoCodigoIdentificador: 0, AlumnoCI: "", AlumnoNombre: "", AlumnoApellido: "", CursoId: 0 });
    setModal(true);
  }

  function abrirEditar(a: Alumno) {
    setEditando(a);
    setForm({
      AlumnoCodigoIdentificador: a.AlumnoCodigoIdentificador,
      AlumnoCI: a.AlumnoCI,
      AlumnoNombre: a.AlumnoNombre,
      AlumnoApellido: a.AlumnoApellido,
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Alumnos</h1>
          <p className="mt-1 text-sm text-gray-500">Administra la informacion de los alumnos</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Alumno
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <Search size={16} />
          Filtros
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            placeholder="Buscar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            placeholder="Buscar por CI..."
            value={filtroCI}
            onChange={(e) => setFiltroCI(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={filtroCursoId ?? ""}
            onChange={(e) => setFiltroCursoId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los cursos</option>
            {cursos?.map((c) => (
              <option key={c.CursoId} value={c.CursoId}>{c.CursoNombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !alumnos?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <GraduationCap className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay alumnos para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {alumnos?.map((a) => (
              <div key={a.AlumnoId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{a.AlumnoNombre} {a.AlumnoApellido}</p>
                    <p className="mt-1 text-sm text-gray-500">CI: {a.AlumnoCI}</p>
                    <p className="text-sm text-gray-500">{a.CursoNombre}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(a)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => eliminar.mutate(a.AlumnoId)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - tabla */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">CI</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Apellido</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alumnos?.map((a) => (
                  <tr key={a.AlumnoId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.AlumnoCodigoIdentificador}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.AlumnoCI}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.AlumnoNombre}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.AlumnoApellido}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.CursoNombre}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(a)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => eliminar.mutate(a.AlumnoId)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Alumno" : "Nuevo Alumno"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Codigo Identificador</label>
                <input
                  type="number"
                  value={form.AlumnoCodigoIdentificador}
                  onChange={(e) => setForm({ ...form, AlumnoCodigoIdentificador: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">CI</label>
                <input
                  value={form.AlumnoCI}
                  onChange={(e) => setForm({ ...form, AlumnoCI: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  value={form.AlumnoNombre}
                  onChange={(e) => setForm({ ...form, AlumnoNombre: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  value={form.AlumnoApellido}
                  onChange={(e) => setForm({ ...form, AlumnoApellido: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Curso</label>
                <select
                  value={form.CursoId}
                  onChange={(e) => setForm({ ...form, CursoId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={0}>Seleccionar curso</option>
                  {cursos?.map((c) => (
                    <option key={c.CursoId} value={c.CursoId}>{c.CursoNombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
