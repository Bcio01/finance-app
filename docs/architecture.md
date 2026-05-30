# Architecture Documentation

## Visión General
**FinanceApp Premium** es una aplicación de escritorio offline-first construida sobre la arquitectura de **Tauri**, utilizando **React** para la interfaz de usuario y **SQLite** (vía Prisma) para el almacenamiento local y persistencia de datos.

El objetivo principal es proveer una experiencia rápida, segura y rica en analíticas sin requerir conexión a internet ni servicios en la nube.

## 1. Arquitectura Frontend (React + Vite)
El frontend está desarrollado con React 19 y empaquetado con Vite para tiempos de compilación y recarga en caliente instantáneos.

### Gestión de Estado (Zustand)
Se utiliza Zustand por su ligereza y enfoque en hooks.
- **`financeStore.js`**: Maneja el estado principal (Transacciones, Categorías, Metas, Presupuestos). Calcula resúmenes, predicciones (IA local) y genera recomendaciones.
- **`settingsStore.js`**: Persiste configuraciones como el PIN de seguridad, la moneda global (`currency`) y el `locale`.
- **`uiStore.js`**: Maneja el estado visual transitorio, como notificaciones (Toasts).

### Sistema Multi-Moneda
- **`useCurrency.js`**: Hook que envuelve el acceso a la moneda configurada en Zustand y expone la función de formato.
- **`currencyFormatter.js`**: Función utilitaria (`formatCurrency`) que usa `Intl.NumberFormat` para adaptar instantáneamente los valores (CLP, USD, EUR) en toda la UI y en la exportación de PDFs.

### Estructura de Directorios
- `src/components/`: Piezas UI reutilizables (Botones, Tarjetas financieras, Gráficos Recharts).
- `src/pages/`: Pantallas principales de la aplicación (Dashboard, Presupuesto, Categorías).
- `src/layouts/`: Plantilla principal (`MainLayout`) con la barra lateral y Command Palette.
- `src/hooks/`: Hooks personalizados (`useCurrency`).
- `src/utils/`: Utilidades matemáticas, criptográficas, exportación PDF y simulaciones analíticas.
- `src/ai/`: Módulos de lógica avanzada para calcular "Financial Score" y predicciones a futuro.

## 2. Arquitectura Tauri (Rust)
La aplicación se compila a un ejecutable nativo utilizando Tauri v2.

- **Seguridad**: No hay servidores web intermediarios expuestos. Toda la comunicación es interna a través de los IPC de Tauri.
- **Rendimiento**: Minimiza el uso de memoria comparado con alternativas basadas en Electron.
- **Configuración (`tauri.conf.json`)**: Configurado para resoluciones de escritorio con permisos ajustados.

## 3. Capa de Datos (Prisma + SQLite)
El backend integrado opera totalmente en memoria local a través de SQLite (`prisma/dev.db`).

- **ORM (Prisma)**: Garantiza la seguridad de tipos entre la base de datos y los servicios de React.
- **Servicios (`src/services/`)**: Centralizan el CRUD hacia Prisma (`transactionService.js`, `goalService.js`, etc.). Esto aísla al estado global (`financeStore.js`) de las sentencias SQL directas.
- **Modelos Principales**:
  - `Transaction`: Gastos e ingresos, ligados a una moneda y categoría.
  - `Category`: Agrupación de transacciones con identificadores de color.
  - `Budget`: Límites de gasto mensuales.
  - `SavingsGoal`: Metas a largo plazo con fecha límite.
  - `AppSettings`: (Migrado a Zustand Persist)

## 4. Sistema de Seguridad y Backups
- **Bloqueo Local (Lock Screen)**: Utiliza un PIN de 4 dígitos guardado de forma cifrada (AES) localmente usando `src/utils/crypto.js`. Detecta inactividad tras 5 minutos y se bloquea automáticamente en `App.jsx`.
- **Backups (`backupService.js`)**: Serializa toda la base de datos a formato JSON descargable y permite sobreescribir (restaurar) los datos.

## 5. Inteligencia Financiera (IA Local)
En lugar de llamadas a APIs externas de LLMs (por razones de privacidad), el proyecto incluye un motor analítico determinista:
- **Scoring**: Evalúa salud financiera basándose en la tasa de ahorro y respeto a presupuestos.
- **Predicción**: Proyecta balances futuros (hasta 6 meses) usando promedios matemáticos y análisis de tendencias.
- **Recomendaciones**: Dispara Alertas Inteligentes (ej. "Gasto Alto" o "Ingreso Detectado") para sugerir acciones inmediatas.