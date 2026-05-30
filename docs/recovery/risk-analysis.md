# Risk Analysis

| Riesgo | Impacto | Mitigación | Estado |
|--------|---------|------------|--------|
| Pérdida de datos en migración | Crítico | Backups JSON obligatorios antes de cambios en DB | Pendiente |
| Incompatibilidad de tipos Prisma/LocalStorage | Medio | Adaptadores con validación de esquemas | Pendiente |
| Bypasseo de PIN via DevTools | Alto | Ofuscación de estado y cifrado asíncrono | Pendiente |
