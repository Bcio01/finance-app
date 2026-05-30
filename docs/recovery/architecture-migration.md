# Architecture Migration

## Estrategia de Migración
1. **Fase 1: Estabilización**: Corregir bugs críticos y seguridad inmediata. (COMPLETADO)
2. **Fase 2: Abstracción**: Implementar Repository Pattern sobre el actual `database.js`. (COMPLETADO)
3. **Fase 3: Integración SQLite**: Crear el adaptador Prisma/SQLite real. (EN PROGRESO)
4. **Fase 4: Migración de Datos**: Mover datos de localStorage a SQLite.

## Nueva Estructura de Capas
- `src/store/`: Estado UI (Zustand). Llama a los Repositories.
- `src/services/repositories/`: Lógica de dominio. No conoce el origen de datos.
- `src/services/databaseManager.js`: Orquestador que decide el Provider activo.
- `src/services/providers/`: Implementaciones técnicas (LocalStorage, SQLite).
- `src/services/database.js`: Proxy de compatibilidad para evitar romper código legacy.
