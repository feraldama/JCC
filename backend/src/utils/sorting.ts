import { Request } from "express";

export function buildOrderBy(
  req: Request,
  validColumns: Record<string, string>,
  defaultOrder: string
): string {
  const { sortBy, sortDir } = req.query;
  if (sortBy && typeof sortBy === "string" && validColumns[sortBy]) {
    const dir = sortDir === "asc" ? "ASC" : "DESC";
    return `ORDER BY ${validColumns[sortBy]} ${dir}`;
  }
  return `ORDER BY ${defaultOrder}`;
}
