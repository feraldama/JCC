"use client";

import { useState } from "react";
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  type Usuario,
} from "@/hooks/useUsuarios";

export default function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios();
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();
  const eliminar = useEliminarUsuario();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({
    UsuarioId: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Admin: false,
    Contrasena: "",
    PerfilId: undefined as number | undefined,
  });

  function abrirCrear() {
    setEditando(null);
    setForm({ UsuarioId: "", Nombre: "", Apellido: "", Correo: "", Admin: false, Contrasena: "", PerfilId: undefined });
    setModal(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u);
    setForm({
      UsuarioId: u.UsuarioId,
      Nombre: u.Nombre,
      Apellido: u.Apellido,
      Correo: u.Correo,
      Admin: u.Admin,
      Contrasena: "",
      PerfilId: u.PerfilId,
    });
    setModal(true);
  }

  async function guardar() {
    if (editando) {
      const { UsuarioId, ...data } = form;
      await actualizar.mutateAsync({
        id: editando.UsuarioId,
        ...data,
        Contrasena: data.Contrasena || undefined,
      });
    } else {
      await crear.mutateAsync(form);
    }
    setModal(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button onClick={abrirCrear} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nuevo Usuario
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
                <th className="px-4 py-3">Apellido</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.map((u) => (
                <tr key={u.UsuarioId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{u.UsuarioId}</td>
                  <td className="px-4 py-3">{u.Nombre}</td>
                  <td className="px-4 py-3">{u.Apellido}</td>
                  <td className="px-4 py-3">{u.Correo}</td>
                  <td className="px-4 py-3">{u.Admin ? "Si" : "No"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${u.Estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.Estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => abrirEditar(u)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => eliminar.mutate(u.UsuarioId)} className="text-red-600 hover:underline">Eliminar</button>
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
            <h2 className="mb-4 text-lg font-bold">{editando ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ID de Usuario</label>
                <input value={form.UsuarioId} onChange={(e) => setForm({ ...form, UsuarioId: e.target.value })} disabled={!!editando} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100" />
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
                <input type="email" value={form.Correo} onChange={(e) => setForm({ ...form, Correo: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contrasena {editando && "(dejar vacio para no cambiar)"}
                </label>
                <input type="password" value={form.Contrasena} onChange={(e) => setForm({ ...form, Contrasena: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.Admin} onChange={(e) => setForm({ ...form, Admin: e.target.checked })} className="rounded" />
                <label className="text-sm font-medium text-gray-700">Administrador</label>
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
