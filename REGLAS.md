# Reglas del Proyecto JCC

## Base de datos: prueba2

### Modelo de datos

#### Seguridad y Acceso
- **usuario**: Login con UsuarioId (varchar 12), contraseña, nombre, apellido, correo, flag admin (S/N), estado (A/I).
- **perfil**: Roles del sistema (ej: Administrador, Cajero, etc.).
- **menu**: Opciones del menú del sistema, identificadas por MenuId (varchar 25).
- **perfilmenu**: Relación N:N entre perfil y menú. Define qué opciones ve cada perfil.
- **usuarioperfil**: Relación N:N entre usuario y perfil. Un usuario puede tener múltiples perfiles.

#### Académico
- **curso**: Cursos disponibles con nombre e importe (cuota mensual).
- **alumno**: Alumnos con CI, nombre, apellido, código identificador y curso asignado (FK a curso).

#### Cobranza y Facturación
- **cobranza**: Cobros mensuales a alumnos. Incluye mes pagado, subtotal cuota, días de mora, monto examen, descuento, nro comprobante, timbrado. Registra qué usuario realizó el cobro.
- **factura**: Talonarios de factura con timbrado, número desde y hasta.

#### Empleados y Pagos
- **empleado**: Empleados con CI, nombre, apellido y monto de cobro.
- **pagoempleado**: Pagos a empleados con fecha, monto entregado, saldo, nro recibo. Registra qué usuario realizó el pago.

#### Contabilidad / Impuestos
- **registro**: Registros contables vinculados a alumnos. Maneja IVA 10%, IVA 5%, IVA Exento, tipo de comprobante, condición, moneda extranjera, imputaciones (IVA, IRE, IRP). Sistema tributario paraguayo.

---

## Pantallas propuestas

### 1. Login
- Autenticación con UsuarioId y contraseña.
- Redirección según perfil/permisos.

### 2. Dashboard
- Resumen de cobranzas del día/mes.
- Alumnos con mora.
- Pagos pendientes a empleados.

### 3. Gestión de Alumnos (CRUD)
- Listado con filtros por curso, nombre, CI.
- Alta/edición/baja de alumnos.
- Asignación de curso.

### 4. Gestión de Cursos (CRUD)
- Listado de cursos con su importe.
- Alta/edición/baja.

### 5. Cobranzas
- Registro de cobros mensuales.
- Selección de alumno, mes a pagar, cálculo automático de mora.
- Campos para examen, descuento, adicionales.
- Generación de comprobante con timbrado y numeración automática.

### 6. Gestión de Facturas
- ABM de talonarios (timbrado, rango desde-hasta).
- Control de numeración disponible.

### 7. Gestión de Empleados (CRUD)
- Listado de empleados.
- Alta/edición/baja.

### 8. Pago a Empleados
- Registro de pagos con monto entregado y saldo.
- Generación de recibo.
- Historial de pagos por empleado.

### 9. Registro Contable
- ABM de registros tributarios.
- Filtros por tipo de registro, fecha, alumno.
- Campos para IVA 10%, 5%, exento, imputaciones.

### 10. Gestión de Usuarios (CRUD)
- Listado de usuarios.
- Alta/edición con asignación de perfiles.
- Activar/desactivar usuarios.

### 11. Gestión de Perfiles y Menús
- ABM de perfiles.
- Asignación de menús a cada perfil.

### 12. Reportes
- Cobranzas por período.
- Alumnos morosos.
- Pagos a empleados por período.
- Libro de registros contables (IVA, IRE, IRP).

---

## Reglas de negocio

1. **Autenticación**: Solo usuarios con UsuarioEstado = 'A' pueden ingresar.
2. **Autorización**: El menú visible depende de los perfiles asignados al usuario (usuario → usuarioperfil → perfil → perfilmenu → menu).
3. **Cobranza**: Cada cobro queda vinculado al alumno y al usuario que lo registró.
4. **Facturación**: Los comprobantes deben respetar el rango del talonario (FacturaDesde - FacturaHasta) y el timbrado vigente.
5. **Mora**: Se calcula en base a CobranzaDiasMora, afectando el monto total.
6. **Pago empleados**: Se maneja saldo (PagoEmpleadoSaldoMonto), permitiendo pagos parciales.
7. **Flags de tipo char(1)**: Los campos como UsuarioIsAdmin, UsuarioEstado, CobranzaFebrero, RegistroMonedaExtranjera, etc. usan 'S'/'N' o 'A'/'I'.
8. **Montos**: Todos los montos son bigint (guaraníes, sin decimales).
9. **IVA paraguayo**: Se manejan 3 tipos: 10%, 5% y exento.

---

## Reglas técnicas

1. **Frontend** en puerto 3000, **Backend** en puerto 3001.
2. API REST con prefijo `/api`.
3. Base de datos PostgreSQL: host localhost, puerto 5432, usuario postgres, contraseña 12345, base prueba2.
4. Nombres de columnas en la DB usan PascalCase (ej: AlumnoNombre, CursoId).
5. Las PKs autoincrementales usan secuencias de PostgreSQL.
6. Las tablas intermedias (perfilmenu, usuarioperfil) tienen PK compuesta.
