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
import { Plus, Pencil, Trash2, X, Loader2, Shield, Settings, Search } from "lucide-react";

export default function PerfilesPage() {
  const { data: perfiles, isLoading } = usePerfiles();
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !perfiles?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            <Shield className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No hay perfiles para mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista mobile - cards */}
          <div className="space-y-3 md:hidden">
            {perfiles?.map((p) => (
              <div key={p.PerfilId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.PerfilDescripcion}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-sm text-gray-400">-</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => abrirMenus(p)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => eliminar.mutate(p.PerfilId)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Descripcion</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Menus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perfiles?.map((p) => (
                  <tr key={p.PerfilId} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5 text-sm text-gray-700">{p.PerfilId}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{p.PerfilDescripcion}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-sm text-gray-400">-</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(p)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => abrirMenus(p)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                        >
                          <Settings size={15} />
                        </button>
                        <button
                          onClick={() => eliminar.mutate(p.PerfilId)}
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

      {/* Modal Perfil */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
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
              <button onClick={guardar} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                Guardar
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
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl md:p-6"
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
