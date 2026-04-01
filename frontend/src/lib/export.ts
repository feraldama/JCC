import * as XLSX from "xlsx";
import { api } from "./api";
import { buildPaginationQuery, type PaginatedResponse } from "./types";

interface ExportColumn<T> {
  header: string;
  value: (item: T) => string | number;
}

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

  ws["!cols"] = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
