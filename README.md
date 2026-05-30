# FinanceApp Premium

Aplicación de escritorio para gestión de finanzas personales, construida con Tauri, React y SQLite. Está diseñada con un enfoque offline-first: los datos se guardan localmente en el dispositivo del usuario y la aplicación no depende de servicios externos para operar.

## Estado del Proyecto

FinanceApp Premium incluye un dashboard financiero, gestión de transacciones, categorías, presupuestos, metas de ahorro, reportes, calculadoras y respaldos cifrados. El proyecto combina una interfaz React con una capa de servicios desacoplada por repositorios, preparada para funcionar en navegador durante desarrollo y con SQLite nativo dentro de Tauri.

## Características

- Dashboard con resumen de balance, ingresos, gastos, ahorro y score financiero.
- Gestión de transacciones con categorías, búsqueda y exportación CSV.
- Presupuestos mensuales por categoría con seguimiento de uso.
- Metas de ahorro con progreso y proyecciones.
- Calculadoras financieras, incluida regla 50/30/20 basada en datos reales del usuario.
- Reportes y exportación PDF.
- Respaldo e importación de datos con validación estricta.
- Backups cifrados con AES-GCM y clave definida por el usuario.
- PIN local protegido con PBKDF2 SHA-256, salt aleatorio y migración de hashes legacy.
- Bloqueo por PIN e inactividad.
- Command Palette con `Ctrl+K`.

## Arquitectura

```text
finance-app/
├── docs/                  Documentación técnica y guías
├── prisma/                Schema Prisma y migraciones SQLite
├── public/                Archivos públicos de Vite
├── src/                   Aplicación React
│   ├── ai/                Scoring, predicciones y categorización local
│   ├── components/        Componentes reutilizables de UI
│   ├── hooks/             Hooks de aplicación
│   ├── layouts/           Layout principal
│   ├── pages/             Pantallas principales
│   ├── services/          Servicios, proveedores y repositorios de datos
│   ├── store/             Stores Zustand
│   ├── styles/            Estilos globales
│   └── utils/             Utilidades de moneda, seguridad, PDF y analítica
└── src-tauri/             Aplicación nativa Tauri/Rust
```

## Stack Técnico

| Área | Tecnología |
|------|------------|
| Desktop | Tauri 2 |
| Frontend | React 19, Vite |
| Estado | Zustand |
| Formularios | React Hook Form, Zod |
| Gráficos | Recharts |
| Base de datos local | SQLite mediante `@tauri-apps/plugin-sql` |
| Modelo y migraciones | Prisma |
| Exportación | jsPDF, jsPDF AutoTable, APIs nativas de Tauri para archivos |
| Seguridad | Web Crypto API, PBKDF2, AES-GCM |

## Persistencia de Datos

La aplicación selecciona el proveedor de datos según el entorno:

- En Tauri usa SQLite nativo a través de `@tauri-apps/plugin-sql`.
- En navegador usa `localStorage` como fallback explícito para desarrollo.

El `DatabaseManager` expone una interfaz común para los repositorios, evitando que las pantallas dependan directamente del motor de persistencia.

## Seguridad

- El PIN no se almacena en texto plano.
- Los PINs nuevos se guardan con PBKDF2 SHA-256, salt aleatorio de 16 bytes y 310.000 iteraciones.
- Los hashes antiguos SHA-256 se migran automáticamente después de una validación correcta.
- Los backups se exportan cifrados con AES-GCM.
- Tauri usa CSP restrictiva:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' ipc: tauri:
```

> Nota: el bloqueo por PIN protege la interfaz local, pero no reemplaza el cifrado completo de disco del sistema operativo.

## Requisitos

- Node.js 20 o superior.
- npm.
- Rust estable.
- Dependencias de Tauri para el sistema operativo.
- En Windows, Visual Studio Build Tools con componentes MSVC y Windows SDK para generar bundles finales.

## Instalación

```bash
npm install
```

Configura las variables de entorno necesarias en `.env`. Para Prisma/SQLite, el proyecto espera una variable `DATABASE_URL`.

Ejemplo:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Desarrollo

Ejecutar solo la interfaz web:

```bash
npm run dev
```

Ejecutar la app con Tauri:

```bash
npm run tauri -- dev
```

## Build

Build web:

```bash
npm run build
```

Información del entorno Tauri:

```bash
npm run tauri -- info
```

Build de escritorio:

```bash
npm run tauri -- build
```

## Prisma

Validar schema:

```bash
npx prisma validate
```

Consultar estado de migraciones:

```bash
npx prisma migrate status
```

Crear o aplicar migraciones durante desarrollo:

```bash
npx prisma migrate dev
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia Vite en modo desarrollo |
| `npm run build` | Ejecuta TypeScript y genera build web |
| `npm run preview` | Sirve el build web localmente |
| `npm run tauri` | Ejecuta comandos de Tauri CLI |

## Validaciones Recomendadas

Antes de entregar cambios:

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npx prisma validate
```

## Documentación

- [Guía de instalación](./docs/installation.md)
- [Guía de usuario](./docs/user-guide.md)
- [Arquitectura](./docs/architecture.md)
- [Configuración de IA](./docs/ai-config.md)
- [Auditoría del proyecto](./docs/project-audit.md)

## Consideraciones de Producto

- La moneda base se bloquea después de la inicialización para evitar mezclar montos históricos en distintas monedas sin conversión.
- Los cálculos monetarios aplican redondeo controlado para reducir errores de punto flotante en JavaScript.
- La app prioriza privacidad local y operación offline sobre sincronización en la nube.

## Roadmap Sugerido

- Importación de extractos bancarios desde CSV.
- Worker o agregaciones SQL para cálculos financieros con grandes volúmenes de transacciones.
- Exportación nativa para reportes PDF.
- Soporte de cifrado de base de datos local.
- Tests automatizados para servicios, repositorios y validaciones de backup.

## Licencia

Proyecto privado. Todos los derechos reservados.
