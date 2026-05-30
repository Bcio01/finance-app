# Guía de Instalación

Esta guía te ayudará a preparar, compilar y ejecutar **FinanceApp Premium** en tu entorno de desarrollo o producción. La aplicación está diseñada para funcionar de forma óptima en Windows.

## 📋 Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:
- **Node.js**: v18 o superior (Se recomienda LTS).
- **Rust**: Requerido por Tauri para compilar el backend nativo. [Instalar Rust](https://www.rust-lang.org/tools/install).
- **Herramientas de compilación C++ para Windows**: Instálalas junto con Visual Studio o usando el paquete de herramientas de compilación. (Solo en Windows).
- **Git**: Para el control de versiones.

## 🚀 1. Instalación del Proyecto

1. **Clonar y acceder al directorio:**
   ```bash
   git clone <repositorio> finance-app
   cd finance-app
   ```

2. **Instalar dependencias de Node:**
   ```bash
   npm install
   ```

## 🗄️ 2. Configuración de Base de Datos Local (SQLite)

La aplicación utiliza SQLite para almacenamiento offline-first manejado a través de Prisma.

1. **Generar el cliente Prisma:**
   Este paso sincroniza el código de Prisma con tu estructura local.
   ```bash
   npx prisma generate
   ```

2. **Aplicar las migraciones (Opcional si es primera vez):**
   Si no existe el archivo `prisma/dev.db`, este comando creará la base de datos basándose en el schema.
   ```bash
   npx prisma migrate dev --name init
   ```

## 🛠️ 3. Ejecutar en Modo Desarrollo

Para lanzar la aplicación en entorno de desarrollo con *Hot-Reload* (React y Rust):

```bash
npm run tauri dev
```
*La primera vez que ejecutes este comando, Rust tomará algunos minutos en compilar las dependencias del backend.*

## 📦 4. Compilar para Producción (Crear EXE)

Para generar el archivo instalador nativo (.exe o .msi en Windows):

```bash
npm run tauri build
```

Una vez finalizado, los binarios compilados se encontrarán en:
`src-tauri/target/release/bundle/`

## ⚠️ Solución a Errores Comunes

- **Error: "Prisma client did not initialize" o Base de Datos en Blanco:**
  Asegúrate de haber ejecutado `npx prisma generate` y verificar que el archivo `prisma/dev.db` tenga permisos de lectura/escritura en tu sistema.

- **Error compilando Rust (Tauri) en Windows:**
  Es probable que te falte el paquete "C++ Build Tools". Descarga *Visual Studio Build Tools*, selecciona "Desarrollo para el escritorio con C++" y asegúrate de que el "SDK de Windows 10/11" esté marcado.

- **El PIN no se guarda o la app se reinicia blanca:**
  La aplicación usa `localStorage` para la sesión y el PIN. Asegúrate de que las opciones de persistencia del Webview de Tauri no estén reseteando datos locales al cerrar en modo desarrollo (en el EXE compilado esto funciona normalmente).

## 🗃️ Ubicación de Datos Sensibles

Tus datos financieros residen exclusivamente de forma local:
- Base de datos: `<carpeta_del_proyecto>/prisma/dev.db`
- En producción, Tauri aloja la base de datos en la carpeta de datos de aplicación local (`%APPDATA%` en Windows).
- Los backups exportados se descargan directamente en tu carpeta predeterminada de `Descargas`.