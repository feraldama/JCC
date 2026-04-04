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
  HandCoins,
  ClipboardList,
  UserCog,
  Shield,
  LogOut,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Académico",
    items: [
      { id: "cursos", path: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
      { id: "alumnos", path: "/dashboard/alumnos", label: "Alumnos", icon: GraduationCap },
    ],
  },
  {
    label: "Cobranzas",
    items: [
      { id: "cobranzas", path: "/dashboard/cobranzas", label: "Cobranzas", icon: Receipt },
      { id: "estado-cuenta", path: "/dashboard/estado-cuenta", label: "Estado de Cuenta", icon: ClipboardList },
      { id: "facturas", path: "/dashboard/facturas", label: "Facturas", icon: FileText },
    ],
  },
  {
    label: "Personal",
    items: [
      { id: "empleados", path: "/dashboard/empleados", label: "Empleados", icon: Users },
      { id: "pago-empleado", path: "/dashboard/pago-empleado", label: "Pago a Empleado", icon: HandCoins },
      { id: "pagos", path: "/dashboard/pagos", label: "Historial Pagos", icon: Wallet },
    ],
  },
  {
    label: "Contable",
    items: [
      { id: "registros", path: "/dashboard/registros", label: "Registros", icon: ClipboardList },
    ],
  },
  {
    label: "Administración",
    items: [
      { id: "usuarios", path: "/dashboard/usuarios", label: "Usuarios", icon: UserCog },
      { id: "perfiles", path: "/dashboard/perfiles", label: "Perfiles", icon: Shield },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { usuario, menus, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = usuario?.UsuarioIsAdmin === "S";
  const allowedIds = new Set(menus.map((m) => m.MenuId.toLowerCase()));

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: isAdmin
        ? group.items
        : group.items.filter((item) => allowedIds.has(item.id)),
    }))
    .filter((group) => group.items.length > 0);

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
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard link */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            pathname === "/dashboard"
              ? "border-l-3 border-blue-400 bg-white/15 text-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-[18px] w-[18px]" />
          Dashboard
        </Link>

        {/* Grouped menu items */}
        {visibleGroups.map((group) => (
          <div key={group.label} className="mt-4">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border-l-3 border-blue-400 bg-white/15 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
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
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
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
