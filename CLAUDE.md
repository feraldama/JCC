# JCC - Sistema de Gestion Escolar

## Convenciones del Frontend

### Cursor en elementos clickeables
Todos los elementos interactivos (botones, links, selects, elementos con `onClick`) deben tener la clase `cursor-pointer` de Tailwind.

### Diseño responsive
Todos los componentes deben ser responsive (mobile-first). Usar las clases responsive de Tailwind (`sm:`, `md:`, `lg:`) para adaptar el layout. El `DataTable` ya maneja esto con cards en mobile y tabla en desktop. Los modales usan bottom-sheet en mobile y centrado en desktop. Los grids de formularios usan `grid-cols-1 sm:grid-cols-2`.

### Formato de fechas
Todas las fechas visibles en el frontend deben mostrarse en formato **dd/mm/aaaa**.
Usar siempre la funcion `formatFecha` de `@/lib/format` en lugar de `toLocaleDateString` u otros metodos manuales.

```ts
import { formatFecha } from "@/lib/format";
formatFecha("2026-03-31"); // "31/03/2026"
formatFecha(new Date());   // "31/03/2026"
```

### Paginacion y busqueda server-side
Los listados que usen `DataTable` deben implementar paginacion y busqueda desde el backend, nunca client-side.

**Backend**: El endpoint GET / debe aceptar `busqueda`, `page`, `limit`, `sortBy`, `sortDir` y devolver `{ data, total }`. Usar `buildOrderBy` de `../utils/sorting` para validar columnas con whitelist.

**Hook**: Debe aceptar `PaginationParams` (`page`, `limit`, `busqueda`, `sortBy`, `sortDir`) y retornar `PaginatedResponse<T>` (`{ data, total }`).

**Pagina**: Debe manejar `page`, `busqueda`, `sortBy` y `sortDir` como estado local y pasarlos al hook y al DataTable.

```ts
// Hook
import { buildPaginationQuery, type PaginatedResponse, type PaginationParams } from "@/lib/types";
export function useEntidad(filtros: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Entidad>>({
    queryKey: ["entidad", filtros],
    queryFn: () => api.get(`/entidad${buildPaginationQuery(filtros)}`),
  });
}

// Pagina
const [page, setPage] = useState(0);
const [busqueda, setBusqueda] = useState("");
const [sortBy, setSortBy] = useState<string | undefined>();
const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
const { data: resp, isLoading } = useEntidad({ busqueda, page, limit: 10, sortBy, sortDir: sortBy ? sortDir : undefined });

<DataTable
  data={resp?.data}
  total={resp?.total}
  onSearch={(q) => { setBusqueda(q); setPage(0); }}
  page={page}
  onPageChange={setPage}
  searchPlaceholder="Buscar..."
  sortBy={sortBy}
  sortDir={sortDir}
  onSort={(key) => {
    if (sortBy === key) { if (sortDir === "asc") setSortDir("desc"); else { setSortBy(undefined); } }
    else { setSortBy(key); setSortDir("asc"); }
    setPage(0);
  }}
  columns={[
    { header: "Nombre", sortKey: "EntidadNombre", render: (e) => e.EntidadNombre },
  ]}
  ...
/>
```

### Ordenamiento server-side
Las columnas del `DataTable` pueden ser ordenables agregando `sortKey` al `Column`. El ciclo de clicks es: sin orden -> ASC -> DESC -> sin orden. El backend valida `sortBy` contra un whitelist de columnas permitidas usando `buildOrderBy(req, validColumns, defaultOrder)` de `backend/src/utils/sorting.ts`.

```ts
// Backend - en el endpoint GET /
import { buildOrderBy } from "../utils/sorting";
const orderBy = buildOrderBy(req, {
  EntidadNombre: '"EntidadNombre"',  // key del frontend -> columna SQL
}, '"EntidadId"');  // orden por defecto
```
