"use client";

import { useState, useRef } from "react";
import {
  useAlumnos,
  useCrearAlumno,
  useActualizarAlumno,
  useEliminarAlumno,
  type Alumno,
} from "@/hooks/useAlumnos";

const CODIGOS_IDENTIFICADOR: Record<number, string> = {
  12: "CEDULA DE IDENTIDAD",
  11: "RUC",
  14: "CEDULA EXTRANJERA",
  15: "SIN NOMBRE",
};
import { useCursos } from "@/hooks/useCursos";
import { Plus, Pencil, Trash2, X, Loader2, GraduationCap, Search, FilterX, AlertCircle } from "lucide-react";
import DataTable from "@/components/DataTable";

export default function AlumnosPage() {
  const [filtroCursoId, setFiltroCursoId] = useState<number | undefined>();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Alumno | null>(null);
  const [form, setForm] = useState({
    AlumnoCodigoIdentificador: 12,
    AlumnoCI: "",
    AlumnoNombre: "",
    AlumnoApellido: "",
    CursoId: 0,
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("AlumnoApellido");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data: resp, isLoading } = useAlumnos({
    cursoId: filtroCursoId,
    busqueda: busqueda || undefined,
    page,
    limit: pageSize,
    sortBy,
    sortDir: sortBy ? sortDir : undefined,
  });
  const alumnos = resp?.data;
  const { data: cursosResp } = useCursos({ limit: 100 });
  const cursos = cursosResp?.data;
  const crear = useCrearAlumno();
  const actualizar = useActualizarAlumno();
  const eliminar = useEliminarAlumno();

  const ciRef = useRef<HTMLInputElement>(null);

  function abrirCrear() {
    setEditando(null);
    setForm({ AlumnoCodigoIdentificador: 12, AlumnoCI: "", AlumnoNombre: "", AlumnoApellido: "", CursoId: 0 });
    setModal(true);
    setTimeout(() => ciRef.current?.focus(), 50);
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

  const [error, setError] = useState("");

  async function guardar() {
    try {
      setError("");
      if (editando) {
        await actualizar.mutateAsync({ id: editando.AlumnoId, ...form });
      } else {
        await crear.mutateAsync(form);
      }
      setModal(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
      setTimeout(() => setError(""), 5000);
    }
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Search size={16} />
            Filtros
          </div>
          {(busqueda || filtroCursoId) && (
            <button
              onClick={() => { setBusqueda(""); setFiltroCursoId(undefined); setPage(0); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FilterX size={14} />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Buscar por nombre, apellido o CI..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={filtroCursoId ?? ""}
            onChange={(e) => { setFiltroCursoId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los cursos</option>
            {cursos?.map((c) => (
              <option key={c.CursoId} value={c.CursoId}>{c.CursoNombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <DataTable
        data={alumnos}
        isLoading={isLoading}
        keyExtractor={(a) => a.AlumnoId}
        emptyIcon={GraduationCap}
        emptyText="No hay alumnos para mostrar"
        total={resp?.total}
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
          { header: "Tipo Doc.", render: (a) => CODIGOS_IDENTIFICADOR[a.AlumnoCodigoIdentificador] ?? a.AlumnoCodigoIdentificador },
          { header: "CI", sortKey: "AlumnoCI", render: (a) => a.AlumnoCI },
          { header: "Nombre", sortKey: "AlumnoNombre", render: (a) => a.AlumnoNombre },
          { header: "Apellido", sortKey: "AlumnoApellido", render: (a) => a.AlumnoApellido },
          { header: "Curso", sortKey: "CursoNombre", render: (a) => a.CursoNombre },
        ]}
        mobileCard={(a) => (
          <>
            <p className="font-medium text-gray-900">{a.AlumnoNombre} {a.AlumnoApellido}</p>
            <p className="mt-1 text-sm text-gray-500">CI: {a.AlumnoCI}</p>
            <p className="text-sm text-gray-500">{a.CursoNombre}</p>
          </>
        )}
        actions={(a) => (
          <>
            <button onClick={() => abrirEditar(a)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este alumno?")) eliminar.mutate(a.AlumnoId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
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
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Alumno" : "Nuevo Alumno"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo Documento</label>
                <select
                  value={form.AlumnoCodigoIdentificador}
                  onChange={(e) => setForm({ ...form, AlumnoCodigoIdentificador: Number(e.target.value) })}
                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={0} disabled>Seleccionar...</option>
                  {Object.entries(CODIGOS_IDENTIFICADOR).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">CI</label>
                <input
                  ref={ciRef}
                  value={form.AlumnoCI}
                  onChange={(e) => setForm({ ...form, AlumnoCI: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  value={form.AlumnoNombre}
                  onChange={(e) => setForm({ ...form, AlumnoNombre: e.target.value.toUpperCase() })}
                  className="w-full uppercase rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  value={form.AlumnoApellido}
                  onChange={(e) => setForm({ ...form, AlumnoApellido: e.target.value.toUpperCase() })}
                  className="w-full uppercase rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
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
