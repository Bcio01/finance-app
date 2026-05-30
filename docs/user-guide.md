# Guía de Usuario - FinanceApp Premium

FinanceApp Premium es una aplicación de escritorio para ordenar tus finanzas personales de forma local. Puedes registrar ingresos y gastos, crear categorías, definir presupuestos, seguir metas de ahorro, revisar reportes y exportar respaldos cifrados.

La app está pensada para funcionar principalmente con pesos chilenos (`CLP`). Si eliges otra moneda al inicio, los formatos se adaptan, pero la moneda base queda bloqueada después de la inicialización para evitar mezclar montos históricos.

## 1. Primer Uso

### Abrir la aplicación

Al iniciar verás el Dashboard. Si aún no tienes datos, los indicadores aparecerán en cero.

La información se almacena localmente:

- En la app de escritorio Tauri se usa SQLite.
- En modo navegador/desarrollo se usa LocalStorage como fallback.

### Elegir moneda base

1. Entra a **Ajustes** desde el menú lateral.
2. Busca la sección **Moneda Global**.
3. Selecciona la moneda que usarás para registrar tus datos.

Para Chile, usa **Peso Chileno (CLP)**.

Una vez inicializada la app, la moneda queda bloqueada. Esto protege la integridad de tus montos, porque la app no convierte automáticamente valores históricos entre monedas.

## 2. Categorías

Las categorías sirven para clasificar ingresos y gastos.

### Crear una categoría

1. Entra a **Categorías**.
2. Escribe un nombre, por ejemplo `Supermercado`, `Transporte`, `Sueldo` o `Arriendo`.
3. Elige un color.
4. Presiona **Crear Categoría**.

### Eliminar una categoría

Puedes eliminar una categoría desde su tarjeta. Cuando lo haces, la app reasigna sus transacciones y presupuestos a una categoría de respaldo llamada **Sin categoria**, para no perder integridad en los datos.

## 3. Transacciones

Las transacciones son los movimientos principales de la app.

### Registrar un gasto o ingreso

1. Abre el modal de nueva transacción desde el Dashboard o desde los flujos disponibles.
2. Selecciona **Ingreso** o **Gasto**.
3. Ingresa el monto.
4. Selecciona una categoría.
5. Agrega una descripción opcional.
6. Presiona **Guardar Transacción**.

Si la moneda activa es `CLP`, los campos de monto muestran `0` como referencia. Para monedas con decimales, la app usa placeholders como `0.00` o `0,00`.

### Revisar historial

1. Entra a **Transacciones**.
2. Usa el buscador para filtrar por descripción o categoría.
3. Revisa fecha, tipo, categoría y monto.

### Exportar CSV

Desde **Transacciones**, presiona **Exportar CSV**.

- En Tauri, la app usa el selector nativo de archivo y escribe el CSV directamente en disco.
- En navegador, usa descarga estándar del navegador.

## 4. Dashboard

El Dashboard resume tu situación financiera:

- **Balance total:** ingresos menos gastos.
- **Ingresos:** suma de movimientos tipo ingreso.
- **Gastos:** suma de movimientos tipo gasto.
- **Ahorros:** balance positivo disponible.

También muestra gráficos, últimas transacciones, presupuesto mensual y el Financial Score cuando hay datos suficientes.

## 5. Presupuestos

Los presupuestos te ayudan a limitar gastos por categoría durante un mes.

### Crear o actualizar un presupuesto

1. Entra a **Presupuesto**.
2. Selecciona una categoría.
3. Ingresa el límite mensual.
4. Presiona **Guardar**.

Si ya existe un presupuesto para esa categoría, mes y año, la app lo actualiza en vez de duplicarlo.

### Interpretar la barra de progreso

- Verde: uso saludable.
- Amarillo: estás cerca del límite.
- Naranjo/rojo: superaste el presupuesto.

## 6. Metas

Las metas permiten seguir objetivos de ahorro.

### Crear una meta

1. Entra a **Metas**.
2. Escribe un nombre, por ejemplo `Fondo de emergencia`.
3. Ingresa el **Monto Objetivo**.
4. Opcionalmente define fecha límite y prioridad.
5. Presiona **Agregar**.

La app muestra el progreso de cada meta y calcula una proyección basada en tus datos.

## 7. Analíticas Pro

La sección **Analíticas Pro** muestra indicadores avanzados.

### Financial Score

Es una puntuación de 0 a 100 basada en:

- capacidad de ahorro,
- cumplimiento de presupuestos,
- avance de metas.

No es una recomendación financiera profesional. Es una guía interna basada en tus propios registros.

### Proyección de balance

La app revisa tus meses anteriores y estima cómo podría evolucionar tu balance durante los próximos meses si mantienes un patrón similar.

### Tendencia I/G

`I/G` significa **Ingresos/Gastos**.

El gráfico compara ingresos proyectados, gastos proyectados y balance estimado. La proyección usa promedios históricos, no IA generativa.

## 8. Calculadoras

En **Calculadoras** encontrarás herramientas para planificar.

### Proyección de ahorro

Sirve para estimar cuántos meses necesitas para llegar a un monto objetivo.

Completa:

1. Monto objetivo.
2. Ahorro mensual.
3. Tasa de interés anual opcional.

### Regla 50/30/20

La app compara tus ingresos y gastos reales con una distribución sugerida:

- 50% necesidades,
- 30% deseos,
- 20% ahorro.

Es una referencia práctica, no una regla obligatoria.

## 9. Calendario

El **Calendario** permite revisar movimientos por fecha. Úsalo para detectar días con mayor gasto, entradas importantes de dinero o patrones mensuales.

## 10. Reportes

En **Reportes** puedes revisar gráficos y resúmenes de tus transacciones.

Si necesitas guardar o compartir información, utiliza las opciones de exportación disponibles en la pantalla.

## 11. Seguridad

### Configurar PIN

1. Entra a **Ajustes**.
2. En **Seguridad Local**, ingresa un PIN de 4 dígitos.
3. Presiona **Activar**.

El PIN se guarda de forma segura usando PBKDF2 con salt aleatorio. La app se bloquea al iniciar y también después de inactividad.

### Quitar PIN

En **Ajustes**, si el PIN está activo, puedes presionar el botón de eliminar para desactivarlo.

## 12. Backups

Los respaldos son importantes si cambias de equipo o quieres conservar una copia externa.

### Exportar backup cifrado

1. Entra a **Ajustes**.
2. Ve a **Gestión de Datos**.
3. Presiona **Exportar Backup**.
4. Ingresa una clave de cifrado.
5. Guarda el archivo generado.

La app cifra el backup con AES-GCM. Guarda la clave en un lugar seguro: si la pierdes, no podrás restaurar ese respaldo.

### Restaurar backup

1. Entra a **Ajustes**.
2. Presiona **Restaurar Backup**.
3. Selecciona el archivo `.json`.
4. Si está cifrado, ingresa la clave.

Importante: restaurar un backup sobreescribe los datos actuales.

## 13. Atajos

### Command Palette

Presiona:

```text
Ctrl + K
```

o en macOS:

```text
Cmd + K
```

Desde ahí puedes navegar rápidamente por la app.

## 14. Buenas Prácticas

- Crea categorías antes de registrar muchas transacciones.
- Registra ingresos y gastos con descripciones claras.
- Revisa el presupuesto al menos una vez por semana.
- Exporta backups cifrados periódicamente.
- Mantén una sola moneda base para todos tus registros.
- No uses el PIN como única defensa si compartes computador; complementa con bloqueo del sistema operativo.

## 15. Solución de Problemas

### El Dashboard aparece vacío

Verifica que tengas transacciones registradas. Si acabas de restaurar un backup, entra a las secciones principales para confirmar que los datos fueron cargados.

### No puedo cambiar la moneda

Es intencional. La moneda se bloquea después de inicializar la app para evitar inconsistencias en los montos.

### No puedo restaurar un backup cifrado

Revisa que estés usando la clave correcta. Los backups cifrados no pueden recuperarse sin esa clave.

### Los montos en CLP no muestran decimales

Es el comportamiento esperado. El peso chileno se muestra sin decimales.
