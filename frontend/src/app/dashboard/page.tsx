"use client";

import { useAuth } from "@/lib/auth";
import {
  GraduationCap,
  Receipt,
  Users,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CardData {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const cards: CardData[] = [
  {
    title: "Total Alumnos",
    value: "-",
    change: "+12% vs mes anterior",
    icon: GraduationCap,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Cobranzas del Mes",
    value: "-",
    change: "+8% vs mes anterior",
    icon: Receipt,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    title: "Empleados",
    value: "-",
    change: "Sin cambios",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Registros",
    value: "-",
    change: "+5% vs mes anterior",
    icon: ClipboardList,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

export default function DashboardPage() {
  const { usuario } = useAuth();

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
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
                {card.value}
              </p>
              <p className="mt-2 text-xs text-gray-400">{card.change}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
