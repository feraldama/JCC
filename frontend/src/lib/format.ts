export function formatGuaranies(monto: number | bigint): string {
  return Number(monto).toLocaleString("es-PY") + " Gs.";
}
