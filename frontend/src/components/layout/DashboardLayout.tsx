"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/alumnos": "Alumnos",
  "/dashboard/cursos": "Cursos",
  "/dashboard/cobranzas": "Cobranzas",
  "/dashboard/facturas": "Facturas",
  "/dashboard/empleados": "Empleados",
  "/dashboard/pagos": "Pagos",
  "/dashboard/registros": "Registros",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/perfiles": "Perfiles",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, usuario, menus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const protectedRoutes = [
    "alumnos", "cursos", "cobranzas", "facturas",
    "empleados", "pagos", "registros", "usuarios", "perfiles",
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated || !usuario) return;
    if (usuario.UsuarioIsAdmin === "S") return;

    const segment = pathname.split("/")[2];
    if (!segment || !protectedRoutes.includes(segment)) return;

    const allowed = menus.some((m) => m.MenuId.toLowerCase() === segment);
    if (!allowed) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, usuario, menus, pathname, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // No renderizar contenido si el usuario no tiene permiso para esta ruta
  const segment = pathname.split("/")[2];
  if (segment && protectedRoutes.includes(segment) && usuario?.UsuarioIsAdmin !== "S") {
    const allowed = menus.some((m) => m.MenuId.toLowerCase() === segment);
    if (!allowed) return null;
  }

  const pageTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      {/* Main content */}
      <main className="lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
