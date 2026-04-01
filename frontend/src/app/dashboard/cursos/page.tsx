"use client";

import { useState, useRef } from "react";
import {
  useCursos,
  useCrearCurso,
  useActualizarCurso,
  useEliminarCurso,
  type Curso,
} from "@/hooks/useCursos";
import { formatGuaranies, formatMiles, parseMiles } from "@/lib/format";
import DataTable from "@/components/DataTable";
import { Plus, Pencil, Trash2, Loader2, BookOpen, Download } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CursosPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("CursoNombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data: resp, isLoading } = useCursos({ busqueda: busqueda || undefined, page, limit: pageSize, sortBy, sortDir: sortBy ? sortDir : undefined });
  const cursos = resp?.data;
  const crear = useCrearCurso();
  const actualizar = useActualizarCurso();
  const eliminar = useEliminarCurso();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [form, setForm] = useState({ CursoNombre: "", CursoImporte: 0 });
  const nombreRef = useRef<HTMLInputElement>(null);

  function abrirCrear() {
    setEditando(null);
    setForm({ CursoNombre: "", CursoImporte: 0 });
    setModal(true);
    setTimeout(() => nombreRef.current?.focus(), 50);
  }

  function abrirEditar(c: Curso) {
    setEditando(c);
    setForm({ CursoNombre: c.CursoNombre, CursoImporte: c.CursoImporte });
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Cursos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los cursos y sus importes mensuales</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Curso>(
              "/cursos",
              { busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "Nombre", value: (c) => c.CursoNombre },
                { header: "Importe", value: (c) => c.CursoImporte },
              ],
              "Cursos"
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
            Nuevo Curso
          </button>
        </div>
      </div>

      <DataTable
        data={cursos}
        isLoading={isLoading}
        keyExtractor={(c) => c.CursoId}
        emptyIcon={BookOpen}
        emptyText="No hay cursos para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar curso..."
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
          { header: "Nombre", sortKey: "CursoNombre", render: (c) => c.CursoNombre },
          { header: "Importe", sortKey: "CursoImporte", render: (c) => formatGuaranies(c.CursoImporte) },
        ]}
        mobileCard={(c) => (
          <>
            <p className="font-medium text-gray-900">{c.CursoNombre}</p>
            <p className="mt-1 text-sm text-gray-500">{formatGuaranies(c.CursoImporte)}</p>
          </>
        )}
        actions={(c) => (
          <>
            <button onClick={() => abrirEditar(c)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este curso?")) eliminar.mutate(c.CursoId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      {/* Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                ref={nombreRef}
                value={form.CursoNombre}
                onChange={(e) => setForm({ ...form, CursoNombre: e.target.value.toUpperCase() })}
                className="w-full uppercase rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Importe</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMiles(form.CursoImporte)}
                onChange={(e) => setForm({ ...form, CursoImporte: parseMiles(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={() => setModal(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={guardar} disabled={crear.isPending || actualizar.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
              {crear.isPending || actualizar.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
