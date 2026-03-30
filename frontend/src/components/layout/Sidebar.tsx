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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const menuRoutes: Record<string, { path: string; label: string; icon: LucideIcon }> = {
  alumnos: { path: "/dashboard/alumnos", label: "Alumnos", icon: GraduationCap },
  cursos: { path: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  cobranzas: { path: "/dashboard/cobranzas", label: "Cobranzas", icon: Receipt },
  facturas: { path: "/dashboard/facturas", label: "Facturas", icon: FileText },
  empleados: { path: "/dashboard/empleados", label: "Empleados", icon: Users },
  pagos: { path: "/dashboard/pagos", label: "Pagos", icon: Wallet },
  registros: { path: "/dashboard/registros", label: "Registros", icon: ClipboardList },
  usuarios: { path: "/dashboard/usuarios", label: "Usuarios", icon: UserCog },
  perfiles: { path: "/dashboard/perfiles", label: "Perfiles", icon: Shield },
};

export default function Sidebar() {
  const { usuario, menus, logout } = useAuth();
  const pathname = usePathname();

  const navItems = menus
    .map((m) => menuRoutes[m.MenuId.toLowerCase()])
    .filter(Boolean);

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-800 text-white">
      <div className="border-b border-slate-700 px-6 py-4">
        <h2 className="text-lg font-bold">JCC</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-slate-700 ${
            pathname === "/dashboard" ? "bg-slate-700" : ""
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-slate-700 ${
                pathname.startsWith(item.path) ? "bg-slate-700" : ""
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 px-6 py-4">
        <p className="mb-2 text-sm text-slate-300">
          {usuario?.Nombre} {usuario?.Apellido}
        </p>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
