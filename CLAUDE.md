# JCC - Sistema de Gestion Escolar

## Convenciones del Frontend

### Formato de fechas
Todas las fechas visibles en el frontend deben mostrarse en formato **dd/mm/aaaa**.
Usar siempre la funcion `formatFecha` de `@/lib/format` en lugar de `toLocaleDateString` u otros metodos manuales.

```ts
import { formatFecha } from "@/lib/format";
formatFecha("2026-03-31"); // "31/03/2026"
formatFecha(new Date());   // "31/03/2026"
```
