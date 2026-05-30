# 🧠 Proyecto
**Finance App** — Offline Personal Finance Desktop App

# 🎯 Objetivo
Aplicación de escritorio para administrar:
- ingresos
- gastos
- ahorros
- presupuestos
- análisis financieros

Todo offline y almacenado localmente.

# ⚙️ Stack tecnológico
- Tauri
- React
- Vite
- SQLite
- Prisma

# 🧱 Arquitectura
- `components/`: Componentes UI reutilizables
- `pages/`: Pantallas principales
- `layouts/`: Layouts generales
- `hooks/`: Hooks personalizados
- `store/`: Estado global
- `services/`: Lógica de acceso a datos y APIs futuras
- `utils/`: Funciones auxiliares
- `constants/`: Constantes globales

# 🧠 Reglas para futuras IAs
Las futuras IAs deben:
- Mantener arquitectura modular
- Evitar dependencias innecesarias
- Priorizar rendimiento
- Mantener compatibilidad offline-first
- No introducir backend externo sin autorización
- Mantener separación entre lógica y UI
- Evitar componentes gigantes
- Mantener código limpio y reutilizable

# 📌 Convenciones
- `PascalCase` → componentes
- `camelCase` → variables y funciones
- Un componente por archivo
- Evitar lógica compleja dentro de JSX

# 💾 Persistencia de datos
- **SQLite** como base de datos principal (`prisma/dev.db`)
- **Prisma** como ORM oficial
- Modelos principales: `Transaction`, `Category`, `SavingsGoal`, `Budget`
- Todo almacenamiento es offline-first
- No usar servicios externos
- Ubicación de servicios: `src/services/`

# 🔒 Seguridad y Backups (Fase 8 & 10)
- **Lock Screen & Auto-Lock**: Sistema de seguridad por PIN de 4 dígitos implementado con cifrado local (`crypto.js`). La aplicación se bloquea automáticamente tras 5 minutos de inactividad.
- **Estado Persistente**: Uso de `zustand/middleware` (persist) para almacenar configuraciones (PIN, tema) en `localStorage`.
- **Manejo de Errores y Notificaciones**:
  - `errorHandler.js` intercepta errores del sistema.
  - Alertas flotantes (Toasts) globales integradas en la interfaz de usuario.
- **Backup Local**: Exportación e importación segura de JSON.
- **Build & UI**: `tauri.conf.json` configurado para ventana HD de escritorio y versionado 1.0.0.

# 🏆 Experiencia Premium (Fase 10)
- **Arquitectura Modular**: Preparada para el futuro con `src/core/`, `src/widgets/`, y `src/modules/`.
- **Command Palette**: Navegación rápida global activada con `CTRL+K` (`CommandPalette.jsx`).
- **Dashboard Avanzado**: Soporta múltiples layouts (Compacto, Estándar, Pro).
- **Herramientas Pro**: Integración de Calendario Financiero interactivo (`Calendar.jsx`) y un Centro de Analíticas Avanzadas (`Analytics.jsx`) con gráficos compuestos.
- **Base de Datos Mock Local**: El sistema utiliza un mock robusto sobre `localStorage` (emulando la API de Prisma) para garantizar compatibilidad multiplataforma y offline sin requerir binarios nativos de base de datos en entornos restringidos.

# 💰 Sistema Multi-Moneda (Fase 11) - COMPLETADO
- **Global Formatter**: Función `formatCurrency` que adapta el formato de moneda y localización dinámicamente (`es-CL` para CLP sin decimales, `en-US` para USD, etc.).
- **Hook `useCurrency`**: Centraliza el acceso al formateador en todo el frontend.
- **Configuración Persistente**: Moneda global (`currency`) guardada en el `settingsStore`.
- **UI Automática**: Todos los componentes, gráficos y exportaciones PDF/CSV reaccionan inmediatamente al cambio de moneda (CLP, USD, EUR) configurado en la vista de Ajustes.
- **Integración con IA**: Alertas y proyecciones adaptadas al formato de moneda global.



# 🚫 Restricciones
- No autenticación todavía
- No nube
- No sincronización online
- No Electron
- No Redux (usar Zustand en futuro)
