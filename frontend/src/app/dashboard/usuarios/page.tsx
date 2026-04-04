"use client";

import { useState, useEffect } from "react";
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  usePerfilesUsuario,
  useAsignarPerfiles,
  type Usuario,
} from "@/hooks/useUsuarios";
import { usePerfiles } from "@/hooks/usePerfiles";
import { Plus, Pencil, Trash2, Loader2, UserCog, Shield, Download, Eye, EyeOff } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { confirmarEliminacion, mostrarExito, mostrarError } from "@/lib/swal";

export default function UsuariosPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>("UsuarioNombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data: resp, isLoading } = useUsuarios({ busqueda: busqueda || undefined, page, limit: pageSize, sortBy, sortDir: sortBy ? sortDir : undefined });
  const usuarios = resp?.data;
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();
  const eliminar = useEliminarUsuario();

  const [modal, setModal] = useState(false);
  const [modalPerfiles, setModalPerfiles] = useState(false);
  const [usuarioPerfiles, setUsuarioPerfiles] = useState<string | null>(null);
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<number[]>([]);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const { data: todosPerfilesResp } = usePerfiles();
  const todosPerfiles = todosPerfilesResp?.data;
  const { data: perfilesAsignados } = usePerfilesUsuario(usuarioPerfiles);
  const asignarPerfiles = useAsignarPerfiles();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    UsuarioId: "",
    UsuarioNombre: "",
    UsuarioApellido: "",
    UsuarioCorreo: "",
    UsuarioIsAdmin: "N",
    UsuarioEstado: "A",
    UsuarioContrasena: "",
  });

  function abrirCrear() {
    setEditando(null);
    setForm({ UsuarioId: "", UsuarioNombre: "", UsuarioApellido: "", UsuarioCorreo: "", UsuarioIsAdmin: "N", UsuarioEstado: "A", UsuarioContrasena: "" });
    setShowPassword(false);
    setModal(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u);
    setForm({
      UsuarioId: u.UsuarioId,
      UsuarioNombre: u.UsuarioNombre,
      UsuarioApellido: u.UsuarioApellido,
      UsuarioCorreo: u.UsuarioCorreo,
      UsuarioIsAdmin: u.UsuarioIsAdmin,
      UsuarioEstado: u.UsuarioEstado,
      UsuarioContrasena: "",
    });
    setShowPassword(false);
    setModal(true);
  }

  useEffect(() => {
    if (perfilesAsignados) {
      setPerfilesSeleccionados(perfilesAsignados.map((p) => p.PerfilId));
    }
  }, [perfilesAsignados]);

  function abrirPerfiles(u: Usuario) {
    setUsuarioPerfiles(u.UsuarioId);
    setPerfilesSeleccionados([]);
    setModalPerfiles(true);
  }

  function togglePerfil(perfilId: number) {
    setPerfilesSeleccionados((prev) =>
      prev.includes(perfilId) ? prev.filter((id) => id !== perfilId) : [...prev, perfilId]
    );
  }

  async function guardarPerfiles() {
    try {
      if (usuarioPerfiles) {
        await asignarPerfiles.mutateAsync({ id: usuarioPerfiles, perfiles: perfilesSeleccionados });
      }
      setModalPerfiles(false);
      setUsuarioPerfiles(null);
      mostrarExito("Perfiles asignados");
    } catch (err: any) {
      mostrarError(err.message || "Error al asignar perfiles");
    }
  }

  async function guardar() {
    try {
      if (editando) {
        const { UsuarioId, UsuarioContrasena, ...data } = form;
        await actualizar.mutateAsync({
          id: editando.UsuarioId,
          ...data,
          ...(UsuarioContrasena ? { UsuarioContrasena } : {}),
        });
      } else {
        await crear.mutateAsync(form);
      }
      setModal(false);
      mostrarExito(editando ? "Usuario actualizado" : "Usuario creado");
    } catch (err: any) {
      mostrarError(err.message || "Error al guardar");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Administra los usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel<Usuario>(
              "/usuarios",
              { busqueda: busqueda || undefined, sortBy, sortDir: sortBy ? sortDir : undefined },
              [
                { header: "ID", value: (u) => u.UsuarioId },
                { header: "Nombre", value: (u) => u.UsuarioNombre },
                { header: "Apellido", value: (u) => u.UsuarioApellido ?? "" },
                { header: "Correo", value: (u) => u.UsuarioCorreo ?? "" },
                { header: "Rol", value: (u) => u.UsuarioIsAdmin === "S" ? "Super Usuario" : "Operador" },
                { header: "Estado", value: (u) => u.UsuarioEstado === "A" ? "Activo" : "Inactivo" },
              ],
              "Usuarios"
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
            Nuevo Usuario
          </button>
        </div>
      </div>

      <DataTable
        data={usuarios}
        isLoading={isLoading}
        keyExtractor={(u) => u.UsuarioId}
        emptyIcon={UserCog}
        emptyText="No hay usuarios para mostrar"
        total={resp?.total}
        searchPlaceholder="Buscar por ID, nombre o correo..."
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
          { header: "ID", sortKey: "UsuarioId", render: (u) => u.UsuarioId, className: "px-4 py-3.5 text-sm font-medium text-gray-900" },
          { header: "Nombre", sortKey: "UsuarioNombre", render: (u) => u.UsuarioNombre },
          { header: "Apellido", sortKey: "UsuarioApellido", render: (u) => u.UsuarioApellido || "-" },
          { header: "Correo", sortKey: "UsuarioCorreo", render: (u) => u.UsuarioCorreo || "-" },
          { header: "Rol", render: (u) => (
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${u.UsuarioIsAdmin === "S" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
              {u.UsuarioIsAdmin === "S" ? "Super Usuario" : "Operador"}
            </span>
          )},
          { header: "Estado", render: (u) => (
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${u.UsuarioEstado === "A" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {u.UsuarioEstado === "A" ? "Activo" : "Inactivo"}
            </span>
          )},
        ]}
        mobileCard={(u) => (
          <>
            <p className="font-medium text-gray-900">{u.UsuarioNombre} {u.UsuarioApellido}</p>
            <p className="mt-0.5 text-xs text-gray-400">ID: {u.UsuarioId}</p>
            <p className="mt-1 text-sm text-gray-500">{u.UsuarioCorreo || "-"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {u.UsuarioIsAdmin === "S" && (
                <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">Admin</span>
              )}
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${u.UsuarioEstado === "A" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {u.UsuarioEstado === "A" ? "Activo" : "Inactivo"}
              </span>
            </div>
          </>
        )}
        actions={(u) => (
          <>
            <button onClick={() => abrirPerfiles(u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600" title="Asignar Perfiles">
              <Shield size={15} />
            </button>
            <button onClick={() => abrirEditar(u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
              <Pencil size={15} />
            </button>
            <button onClick={async () => { if (await confirmarEliminacion("este usuario")) eliminar.mutate(u.UsuarioId); }} className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </>
        )}
      />

      {/* Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ID de Usuario</label>
              <input
                value={form.UsuarioId}
                onChange={(e) => setForm({ ...form, UsuarioId: e.target.value })}
                disabled={!!editando}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                value={form.UsuarioNombre}
                onChange={(e) => setForm({ ...form, UsuarioNombre: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Apellido</label>
              <input
                value={form.UsuarioApellido}
                onChange={(e) => setForm({ ...form, UsuarioApellido: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                value={form.UsuarioCorreo}
                onChange={(e) => setForm({ ...form, UsuarioCorreo: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña {editando && "(vacío = no cambiar)"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.UsuarioContrasena}
                  onChange={(e) => setForm({ ...form, UsuarioContrasena: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={form.UsuarioIsAdmin}
                onChange={(e) => setForm({ ...form, UsuarioIsAdmin: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="S">Super Usuario</option>
                <option value="N">Operador</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={form.UsuarioEstado}
                onChange={(e) => setForm({ ...form, UsuarioEstado: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
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
      {/* Modal Perfiles */}
      <Dialog open={modalPerfiles} onOpenChange={(open) => { setModalPerfiles(open); if (!open) setUsuarioPerfiles(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Perfiles - {usuarioPerfiles}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Selecciona los perfiles que tendrá el usuario. Los menús de cada perfil se aplicarán al operador.
          </p>
          <div className="space-y-2">
            {todosPerfiles?.map((p) => (
              <label
                key={p.PerfilId}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  perfilesSeleccionados.includes(p.PerfilId)
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={perfilesSeleccionados.includes(p.PerfilId)}
                  onChange={() => togglePerfil(p.PerfilId)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">{p.PerfilDescripcion}</span>
              </label>
            ))}
            {!todosPerfiles?.length && (
              <p className="py-4 text-center text-sm text-gray-400">No hay perfiles creados</p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={() => { setModalPerfiles(false); setUsuarioPerfiles(null); }} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={guardarPerfiles} className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700">
              Guardar Perfiles
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
