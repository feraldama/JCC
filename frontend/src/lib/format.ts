export function formatGuaranies(monto: number | bigint): string {
  return Number(monto).toLocaleString("es-PY") + " Gs.";
}

export function formatMiles(valor: number | bigint): string {
  return Number(valor).toLocaleString("es-PY");
}

export function parseMiles(texto: string): number {
  return Number(texto.replace(/\./g, "")) || 0;
}

export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const aaaa = d.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}
