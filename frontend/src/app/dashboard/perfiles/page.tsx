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
  const [form, setForm] = useState({ Nombre: "" });
  const [menusSeleccionados, setMenusSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    if (perfilMenus?.Menus) {
      setMenusSeleccionados(perfilMenus.Menus.map((m) => m.MenuId));
    }
  }, [perfilMenus]);

  function abrirCrear() {
    setEditando(null);
    setForm({ Nombre: "" });
    setModal(true);
  }

  function abrirEditar(p: Perfil) {
    setEditando(p);
    setForm({ Nombre: p.Nombre });
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
      await asignarMenus.mutateAsync({ id: perfilMenus.PerfilId, menuIds: menusSeleccionados });
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Perfiles</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Perfil
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Menus</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {perfiles?.map((p) => (
                <tr key={p.PerfilId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{p.PerfilId}</td>
                  <td className="px-4 py-3">{p.Nombre}</td>
                  <td className="px-4 py-3">
                    {p.Menus?.map((m) => m.Nombre).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(p)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => abrirMenus(p)} className="text-green-600 hover:underline">Menus</button>
                    <button onClick={() => eliminar.mutate(p.PerfilId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Perfil" : "Nuevo Perfil"}</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
              <input value={form.Nombre} onChange={(e) => setForm({ Nombre: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Cancelar</button>
              <button onClick={guardar} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {modalMenus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Asignar Menus - {perfilMenus?.Nombre}</h2>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {todosMenus?.map((m) => (
                <label key={m.MenuId} className="flex items-center gap-2 rounded p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={menusSeleccionados.includes(m.MenuId)}
                    onChange={() => toggleMenu(m.MenuId)}
                    className="rounded"
                  />
                  <span className="text-sm">{m.Nombre}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalMenus(false)} className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Cancelar</button>
              <button onClick={guardarMenus} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
