"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Receipt,
  FileText,
  Users,
  Wallet,
  ClipboardList,
  UserCog,
  Shield,
  LogOut,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const menuRoutes: Record<string, { path: string; label: string; icon: LucideIcon }> = {
  cursos: { path: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  alumnos: { path: "/dashboard/alumnos", label: "Alumnos", icon: GraduationCap },
  cobranzas: { path: "/dashboard/cobranzas", label: "Cobranzas", icon: Receipt },
  facturas: { path: "/dashboard/facturas", label: "Facturas", icon: FileText },
  empleados: { path: "/dashboard/empleados", label: "Empleados", icon: Users },
  pagos: { path: "/dashboard/pagos", label: "Pagos", icon: Wallet },
  registros: { path: "/dashboard/registros", label: "Registros", icon: ClipboardList },
  usuarios: { path: "/dashboard/usuarios", label: "Usuarios", icon: UserCog },
  perfiles: { path: "/dashboard/perfiles", label: "Perfiles", icon: Shield },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { usuario, menus, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = usuario?.UsuarioIsAdmin === "S";
  const navItems = isAdmin
    ? Object.values(menuRoutes)
    : menus.map((m) => menuRoutes[m.MenuId.toLowerCase()]).filter(Boolean);

  const initials =
    (usuario?.UsuarioNombre?.[0] ?? "") + (usuario?.UsuarioApellido?.[0] ?? "");

  const sidebarContent = (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">JCC</h2>
            <p className="text-[11px] text-slate-400">Gestión Académica</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menú
        </p>
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${pathname === "/dashboard"
              ? "border-l-3 border-blue-400 bg-white/15 text-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
        >
          <LayoutDashboard className="h-[18px] w-[18px]" />
          Dashboard
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                  ? "border-l-3 border-blue-400 bg-white/15 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="rounded-xl bg-slate-800/50 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {usuario?.UsuarioNombre} {usuario?.UsuarioApellido}
              </p>
              <p className="truncate text-xs text-slate-400">
                ID: {usuario?.UsuarioId}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block">
        {sidebarContent}
      </div>
    </>
  );
}
