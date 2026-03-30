"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const menuRoutes: Record<string, { path: string; label: string }> = {
  alumnos: { path: "/dashboard/alumnos", label: "Alumnos" },
  cursos: { path: "/dashboard/cursos", label: "Cursos" },
  cobranzas: { path: "/dashboard/cobranzas", label: "Cobranzas" },
  facturas: { path: "/dashboard/facturas", label: "Facturas" },
  empleados: { path: "/dashboard/empleados", label: "Empleados" },
  pagos: { path: "/dashboard/pagos", label: "Pagos" },
  registros: { path: "/dashboard/registros", label: "Registros" },
  usuarios: { path: "/dashboard/usuarios", label: "Usuarios" },
  perfiles: { path: "/dashboard/perfiles", label: "Perfiles" },
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
          className={`block px-6 py-2 text-sm hover:bg-slate-700 ${
            pathname === "/dashboard" ? "bg-slate-700" : ""
          }`}
        >
          Dashboard
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-6 py-2 text-sm hover:bg-slate-700 ${
              pathname.startsWith(item.path) ? "bg-slate-700" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-6 py-4">
        <p className="mb-2 text-sm text-slate-300">
          {usuario?.Nombre} {usuario?.Apellido}
        </p>
        <button
          onClick={logout}
          className="w-full rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
