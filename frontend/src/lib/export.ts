import XLSX from "xlsx-js-style";
import { api } from "./api";
import { buildPaginationQuery, type PaginatedResponse } from "./types";

interface ExportColumn<T> {
  header: string;
  value: (item: T) => string | number;
  type?: "money";
}

const border = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
} as const;

export async function exportToExcel<T>(
  endpoint: string,
  filters: Record<string, unknown>,
  columns: ExportColumn<T>[],
  fileName: string
) {
  const query = buildPaginationQuery({ ...filters, page: 0, limit: 10000 });
  const resp = await api.get<PaginatedResponse<T>>(`${endpoint}${query}`);

  const headers = columns.map((c) => c.header);
  const rows = resp.data.map((item) => columns.map((c) => c.value(item)));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-ajustar ancho de columnas
  ws["!cols"] = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  // Aplicar estilos: negrita en headers + bordes en todas las celdas + formato moneda
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const addr = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[addr]) continue;
      if (row === 0) {
        ws[addr].s = {
          font: { bold: true },
          border,
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: { horizontal: "center" },
        };
      } else if (columns[col]?.type === "money") {
        ws[addr].t = "n";
        ws[addr].v = Number(ws[addr].v) || 0;
        ws[addr].s = { border, numFmt: "#,##0" };
      } else {
        ws[addr].s = { border };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
