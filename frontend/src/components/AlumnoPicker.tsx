"use client";

import { useState, useRef, useEffect } from "react";
import { useBuscarAlumnos, type Alumno } from "@/hooks/useAlumnos";
import { Search, X, Loader2 } from "lucide-react";

interface AlumnoPickerProps {
  value: number;
  onChange: (id: number) => void;
  selectedLabel?: string;
}

export default function AlumnoPicker({ value, onChange, selectedLabel }: AlumnoPickerProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: resp, isLoading } = useBuscarAlumnos(debounced);
  const resultados = resp?.data;

  function seleccionar(a: Alumno) {
    onChange(a.AlumnoId);
    setQuery(`${a.AlumnoApellido}, ${a.AlumnoNombre} - CI: ${a.AlumnoCI}`);
    setOpen(false);
  }

  function limpiar() {
    onChange(0);
    setQuery("");
    setDebounced("");
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={selectedLabel || "Buscar por CI, nombre o apellido..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (value && e.target.value === "") limpiar(); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-8 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {value > 0 && (
          <button
            type="button"
            onClick={limpiar}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && debounced.trim().length >= 2 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <li className="flex items-center justify-center px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </li>
          ) : !resultados?.length ? (
            <li className="px-4 py-3 text-sm text-gray-400">Sin resultados</li>
          ) : (
            resultados.map((a) => (
              <li
                key={a.AlumnoId}
                onClick={() => seleccionar(a)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${a.AlumnoId === value ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"}`}
              >
                <span className="font-medium">{a.AlumnoApellido}, {a.AlumnoNombre}</span>
                <span className="ml-2 text-gray-400">CI: {a.AlumnoCI}</span>
                {a.CursoNombre && <span className="ml-2 text-xs text-gray-400">({a.CursoNombre})</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
