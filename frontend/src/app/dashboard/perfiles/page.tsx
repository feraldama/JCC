"use client";

import { useState, useEffect } from "react";
import {
  usePerfiles,
  useMenus,
  useCrearPerfil,
  useActualizarPerfil,
  useEliminarPerfil,
  useAsignarMenus,
  type Perfil,
} from "@/hooks/usePerfiles";
import { Plus, Pencil, Trash2, X, Loader2, Shield, Settings } from "lucide-react";
import DataTable from "@/components/DataTable";

export default function PerfilesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("PerfilDescripcion");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data: resp, isLoading } = usePerfiles({ busqueda: busqueda || undefined, page, limit: pageSize, sortBy, sortDir: sortBy ? sortDir : undefined });
  const perfiles = resp?.data;
  const { data: todosMenus } = useMenus();
  const crear = useCrearPerfil();
  const actualizar = useActualizarPerfil();
  const eliminar = useEliminarPerfil();
  const asignarMenus = useAsignarMenus();

  const [modal, setModal] = useState(false);
  const [modalMenus, setModalMenus] = useState(false);
  const [editando, setEditando] = useState<Perfil | null>(null);
  const [perfilMenus, setPerfilMenus] = useState<Perfil | null>(null);
  const [form, setForm] = useState({ PerfilDescripcion: "" });
  const [menusSeleccionados, setMenusSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    if (perfilMenus?.menus) {
      setMenusSeleccionados(perfilMenus.menus.map((m) => m.MenuId));
    }
  }, [perfilMenus]);

  function abrirCrear() {
    setEditando(null);
    setForm({ PerfilDescripcion: "" });
    setModal(true);
  }

  function abrirEditar(p: Perfil) {
    setEditando(p);
    setForm({ PerfilDescripcion: p.PerfilDescripcion });
    setModal(true);
  }

  function abrirMenus(p: Perfil) {
    setPerfilMenus(p);
    setModalMenus(true);
  }

  async function guardar() {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.PerfilId, ...form });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  async function guardarMenus() {
    if (perfilMenus) {
      await asignarMenus.mutateAsync({ id: perfilMenus.PerfilId, menus: menusSeleccionados });
    }
    setModalMenus(false);
  }

  function toggleMenu(menuId: string) {
    setMenusSeleccionados((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Perfiles</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los perfiles y permisos del sistema</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Perfil
        </button>
      </div>

      <DataTable
        data={perfiles}
        isLoading={isLoading}
        keyExtractor={(p) => p.PerfilId}
        emptyIcon={Shield}
        emptyText="No hay perfiles para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar perfil..."
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
          { header: "ID", render: (p) => p.PerfilId },
          { header: "Descripcion", sortKey: "PerfilDescripcion", render: (p) => p.PerfilDescripcion },
          { header: "Menus", render: (p) => (
            <div className="flex flex-wrap gap-1">
              {p.menus?.length ? p.menus.map((m) => (
                <span key={m.MenuId} className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{m.MenuNombre}</span>
              )) : <span className="text-xs text-gray-400">Sin menus</span>}
            </div>
          )},
        ]}
        mobileCard={(p) => (
          <>
            <p className="font-medium text-gray-900">{p.PerfilDescripcion}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.menus?.length ? p.menus.map((m) => (
                <span key={m.MenuId} className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{m.MenuNombre}</span>
              )) : <span className="text-xs text-gray-400">Sin menus</span>}
            </div>
          </>
        )}
        actions={(p) => (
          <>
            <button onClick={() => abrirEditar(p)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={() => abrirMenus(p)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600">
              <Settings size={15} />
            </button>
            <button onClick={() => { if (confirm("¿Eliminar este perfil?")) eliminar.mutate(p.PerfilId); }} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      {/* Modal Perfil */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[100vh] sm:max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-10 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editando ? "Editar Perfil" : "Nuevo Perfil"}</h2>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Descripcion</label>
                <input
                  value={form.PerfilDescripcion}
                  onChange={(e) => setForm({ PerfilDescripcion: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

      {/* Modal Menus */}
      {modalMenus && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModalMenus(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[100vh] sm:max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-10 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Asignar Menus - {perfilMenus?.PerfilDescripcion}</h2>
              <button onClick={() => setModalMenus(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {todosMenus?.map((m) => (
                <label
                  key={m.MenuId}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    menusSeleccionados.includes(m.MenuId)
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={menusSeleccionados.includes(m.MenuId)}
                    onChange={() => toggleMenu(m.MenuId)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{m.MenuNombre}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setModalMenus(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardarMenus} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
