# CARMEL — Guía de instalación y puesta en marcha (para testeo)

Este documento explica **paso a paso** cómo instalar y ejecutar el proyecto **CARMEL** (e-commerce "Productos de mi tierra") en una PC nueva, para poder realizar el testeo funcional de la aplicación.

El proyecto tiene dos partes que deben ejecutarse **al mismo tiempo**, en dos terminales distintas:

- **`CARMEL_API`** → Backend (Node.js + Express + Sequelize + MySQL/MariaDB) — puerto `3000`
- **`CARMEL_APP`** → Frontend (React + Vite + Tailwind) — puerto `5173`

---

## 1. Requisitos previos

Antes de descomprimir el proyecto, instalar en la PC:

| Software | Versión | Descarga |
| --- | --- | --- |
| **Node.js** | 18 o superior (incluye npm) | https://nodejs.org/ (elegir la versión LTS) |
| **MySQL** o **MariaDB** | 8.x / 10.x | https://dev.mysql.com/downloads/installer/ o instalar **XAMPP** (https://www.apachefriends.org/) que ya incluye MariaDB |
| **Editor de código** (opcional, recomendado) | — | Visual Studio Code |
| **Cliente de base de datos** (opcional, recomendado) | — | MySQL Workbench, DBeaver, o el phpMyAdmin de XAMPP |

Para verificar que Node.js quedó bien instalado, abrir una terminal (CMD, PowerShell o Terminal) y ejecutar:

```bash
node -v
npm -v
```

Ambos comandos deben devolver un número de versión (no un error).

---

## 2. Descomprimir el proyecto

Descomprimir el archivo `.zip` recibido. Debe quedar una carpeta con esta estructura:

```
CARMEL/
├── README.md          ← este archivo
├── CARMEL_API/         ← backend
└── CARMEL_APP/         ← frontend
```

---

## 3. Poner en marcha la base de datos

1. Iniciar el servicio de MySQL/MariaDB (si se usa XAMPP: abrir el Panel de Control de XAMPP y presionar **Start** en el módulo `MySQL`).
2. Abrir el cliente de base de datos (MySQL Workbench, DBeaver o phpMyAdmin) y conectarse al servidor local (usuario `root`, contraseña según la instalación — en XAMPP suele ser vacía).
3. Ejecutar el script `CARMEL_API/database.sql` completo. Este script:
   - Crea la base de datos `carmel` automáticamente (no hace falta crearla antes a mano).
   - Crea todas las tablas necesarias (usuarios, roles, categorías, productos, carrito, órdenes, etc.).

   También se puede ejecutar desde la terminal, parados dentro de la carpeta `CARMEL_API`:

   ```bash
   mysql -u root -p < database.sql
   ```

---

## 4. Configurar y levantar el Backend (CARMEL_API)

Abrir una terminal **dentro de la carpeta `CARMEL_API`**:

```bash
cd CARMEL_API
```

### 4.1. Crear el archivo de variables de entorno

Copiar el archivo de ejemplo:

- En Windows (CMD):
  ```bash
  copy .env.example .env
  ```
- En Windows (PowerShell), Linux o macOS:
  ```bash
  cp .env.example .env
  ```

Abrir el archivo `.env` recién creado con un editor de texto y completar los datos de conexión a la base de datos (dejar los demás valores como están, salvo que se necesite cambiar el puerto):

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=carmel
DB_USER=root
DB_PASSWORD=       ← completar con la contraseña de MySQL/MariaDB (dejar vacío si no tiene)
JWT_SECRET=carmel_clave_secreta_cambiar
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

### 4.2. Instalar dependencias

```bash
npm install
```

Esto descarga automáticamente todas las librerías necesarias (Express, Sequelize, JWT, bcrypt, etc.) indicadas en `package.json`. Puede tardar uno o dos minutos.

### 4.3. Cargar datos de prueba

```bash
npm run seed
```

Este comando carga en la base de datos las categorías, productos y usuarios de prueba (ver sección 6).

### 4.4. Iniciar el servidor

```bash
npm run dev
```

Si todo salió bien, en la terminal debe aparecer:

```
✓ Conexión a base de datos establecida
✓ CARMEL API ejecutándose en http://localhost:3000
```

Para comprobar que el backend responde, abrir en el navegador:
`http://localhost:3000/api/status`

**Dejar esta terminal abierta** mientras se hace el testeo.

---

## 5. Configurar y levantar el Frontend (CARMEL_APP)

Abrir una **segunda terminal** (sin cerrar la del backend), dentro de la carpeta `CARMEL_APP`:

```bash
cd CARMEL_APP
```

### 5.1. Crear el archivo de variables de entorno

```bash
copy .env.example .env      (Windows CMD)
cp .env.example .env        (PowerShell / Linux / macOS)
```

Por defecto ya apunta al backend local, no hace falta modificarlo salvo que el backend corra en otra PC o puerto:

```
VITE_API_URL=http://localhost:3000/api
```

### 5.2. Instalar dependencias

```bash
npm install
```

### 5.3. Iniciar la aplicación

```bash
npm run dev
```

La terminal va a mostrar una URL similar a:

```
Local:   http://localhost:5173/
```

Abrir esa dirección en el navegador. Ahí ya se puede usar y testear la aplicación completa.

---

## 6. Usuarios de prueba

Una vez ejecutado `npm run seed` en el backend, quedan disponibles estos usuarios para hacer login desde el frontend:

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@carmel.com` | `admin123` |
| Cliente | `cliente@carmel.com` | `cliente123` |

Con el usuario **Administrador** se accede al panel de gestión (productos, pedidos, usuarios). Con el usuario **Cliente** (o registrando uno nuevo desde la app) se prueba el flujo de compra normal.

---

## 7. Resumen de comandos (referencia rápida)

**Backend** (`CARMEL_API`):
```bash
cp .env.example .env      # completar credenciales de la base de datos
npm install
npm run seed
npm run dev                # queda escuchando en http://localhost:3000
```

**Frontend** (`CARMEL_APP`), en otra terminal:
```bash
cp .env.example .env
npm install
npm run dev                # queda escuchando en http://localhost:5173
```

---

## 8. Solución de problemas frecuentes

| Problema | Causa probable | Solución |
| --- | --- | --- |
| `✗ No se pudo conectar a la base de datos` | MySQL/MariaDB no está iniciado, o los datos del `.env` están mal | Verificar que el servicio MySQL esté corriendo y revisar `DB_USER`/`DB_PASSWORD`/`DB_PORT` en `CARMEL_API/.env` |
| `Error: listen EADDRINUSE :::3000` | Ya hay algo corriendo en el puerto 3000 | Cerrar la otra aplicación que usa ese puerto, o cambiar `PORT` en el `.env` del backend |
| El frontend no trae datos / errores de red en la consola del navegador | El backend no está corriendo, o `VITE_API_URL` no coincide con el puerto del backend | Verificar que la terminal del backend siga abierta y sin errores, y que `VITE_API_URL` en `CARMEL_APP/.env` apunte al puerto correcto |
| Error de CORS en la consola del navegador | `CORS_ORIGIN` en el backend no coincide con la URL del frontend | Verificar que `CORS_ORIGIN` en `CARMEL_API/.env` sea exactamente `http://localhost:5173` (o el puerto que muestre Vite) |
| `npm install` falla o tarda mucho | Problema de conexión a internet o versión de Node muy vieja | Verificar `node -v` (debe ser 18+) y reintentar `npm install` |
| Login de administrador/cliente no funciona | No se ejecutó `npm run seed`, o se ejecutó antes de crear las tablas con `database.sql` | Repetir en orden: ejecutar `database.sql` → `npm install` → `npm run seed` |

---

## 9. Alcance funcional a tener en cuenta al testear

- El pago con Mercado Pago está **simulado**: al confirmar la compra se genera la orden y se descuenta el stock, pero no se realiza un cobro real. Esto es intencional y está fuera del alcance de esta versión del proyecto.
- El envío de email de confirmación de compra no está implementado en esta versión.
- El código QR que se muestra en la pantalla de confirmación de compra es ilustrativo, no corresponde a un sistema de seguimiento real.

Para el detalle completo de endpoints de la API y estructura del frontend, ver los archivos `README.md` dentro de cada carpeta (`CARMEL_API/README.md` y `CARMEL_APP/README.md`).
