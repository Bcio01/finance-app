# Fixed Issues

| ID | Problema | Severidad | Solución | Validación |
|----|----------|-----------|----------|------------|
| ST-01 | Crash en Transactions.jsx (format undefined) | CRÍTICO | Importación de useCurrency y hook format | Manual - Página carga correctamente |
| SEC-01 | PIN reversible (XOR) | ALTO | Implementación de SHA-256 (crypto.subtle) | Manual - Bloqueo funcional y no reversible |
| DAT-01 | Categorías huérfanas al borrar | MEDIO | Re-asignación a null y borrado de presupuestos | Manual - Gráficos no rompen |
| DAT-02 | Pérdida de datos en importación fallida | ALTO | Snapshot de localStorage y Rollback | Manual - Datos vuelven tras error JSON |
| BUS-01 | Inconsistencia cambiaria (Moneda libre) | ALTO | Flag isInitialized para bloquear moneda base | Manual - Selector se deshabilita tras primer uso |
