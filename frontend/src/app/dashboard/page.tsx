"use client";

const cards = [
  { title: "Total Alumnos", value: "-", color: "bg-blue-500" },
  { title: "Cobranzas del Mes", value: "-", color: "bg-green-500" },
  { title: "Empleados", value: "-", color: "bg-purple-500" },
  { title: "Registros del Mes", value: "-", color: "bg-orange-500" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg bg-white p-6 shadow">
            <div className={`mb-3 inline-block rounded px-3 py-1 text-sm text-white ${card.color}`}>
              {card.title}
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
