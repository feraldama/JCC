"use client";

import { useAuth } from "@/lib/auth";
import { useDashboard } from "@/hooks/useDashboard";
import { formatGuaranies, formatFecha } from "@/lib/format";
import {
  GraduationCap,
  Receipt,
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MESES: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function formatMes(yyyymm: string) {
  const [, mm] = yyyymm.split("-");
  return MESES[mm] ?? mm;
}

interface CardData {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const { data: stats, isLoading } = useDashboard();

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cards: CardData[] = [
    {
      title: "Total Alumnos",
      value: stats ? String(stats.totalAlumnos) : "-",
      subtitle: stats
        ? `En ${stats.alumnosPorCurso.length} cursos`
        : "Cargando...",
      icon: GraduationCap,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Cobranzas del Mes",
      value: stats ? formatGuaranies(stats.cobranzasMes.monto) : "-",
      subtitle: stats
        ? `${stats.cobranzasMes.cantidad} cobros realizados`
        : "Cargando...",
      icon: Receipt,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Empleados",
      value: stats ? String(stats.totalEmpleados) : "-",
      subtitle: stats
        ? `Pagos del mes: ${formatGuaranies(stats.pagosMes.monto)}`
        : "Cargando...",
      icon: Users,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Registros del Mes",
      value: stats ? String(stats.registrosMes) : "-",
      subtitle: "Registros contables",
      icon: ClipboardList,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          Bienvenido, {usuario?.UsuarioNombre ?? "Usuario"}
        </h1>
        <p className="mt-1 text-sm capitalize text-gray-500">{dateStr}</p>
      </div>

      {/* Cards grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                ) : (
                  card.value
                )}
              </p>
              <p className="mt-2 text-xs text-gray-400">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Cobranzas por mes */}
      <div className="mb-6">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Cobranzas por Mes
          </h2>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : stats && stats.cobranzasPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.cobranzasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mes"
                  tickFormatter={formatMes}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : String(v)
                  }
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [
                    formatGuaranies(Number(value)),
                    "Monto",
                  ]}
                  labelFormatter={(label) => formatMes(String(label))}
                />
                <Bar dataKey="monto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-gray-400">
              Sin datos de cobranzas
            </p>
          )}
        </div>
      </div>

      {/* Alumnos por curso */}
      <div className="mb-6">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Alumnos por Curso
          </h2>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : stats && stats.alumnosPorCurso.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={Math.max(280, stats.alumnosPorCurso.length * 28)}
            >
              <BarChart
                data={stats.alumnosPorCurso}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  formatter={(value) => [value, "Alumnos"]}
                />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-gray-400">
              Sin datos de cursos
            </p>
          )}
        </div>
      </div>

      {/* Bottom row: recent collections + morosos */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {/* Cobranzas recientes */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Cobranzas Recientes
          </h2>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : stats && stats.cobranzasRecientes.length > 0 ? (
            <div className="space-y-3">
              {stats.cobranzasRecientes.map((c) => (
                <div
                  key={c.CobranzaId}
                  className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.AlumnoNombre} {c.AlumnoApellido}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFecha(c.CobranzaFecha)} — Mes:{" "}
                      {c.CobranzaMesPagado}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    {formatGuaranies(c.CobranzaTotal)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex h-40 items-center justify-center text-sm text-gray-400">
              Sin cobranzas recientes
            </p>
          )}
        </div>

        {/* Alumnos morosos */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alumnos con Mora
          </h2>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : stats && stats.alumnosMorosos.length > 0 ? (
            <div className="space-y-3">
              {stats.alumnosMorosos.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.AlumnoNombre} {m.AlumnoApellido}
                    </p>
                    <p className="text-xs text-gray-400">
                      CI: {m.AlumnoCI} —{" "}
                      {formatFecha(m.CobranzaFecha)}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    {m.CobranzaDiasMora} días
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex h-40 items-center justify-center text-sm text-gray-400">
              No hay alumnos con mora
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
