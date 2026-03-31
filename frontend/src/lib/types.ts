export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildPaginationQuery(params: any) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}
