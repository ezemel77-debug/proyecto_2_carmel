# INSTALACION

## requisitos

- node 20+ y npm
- mysql 8 corriendo

## 1. base de datos

Crear la db en mysql:

```sql
CREATE DATABASE ecommerce_carmel;
```

o a través de la interfaz gráfica.

## 2. backend (API)

```bash
cd API
npm install
```

Crear `API/.env` con estos valores:

```env
PORT=3000
JWT_SECRET_CLIENT=tu_clave_cliente
JWT_SECRET_ADMIN=tu_clave_admin
CORS_ORIGINS=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ecommerce_carmel
DB_DIALECT=mysql
```

Alternativamente, copiar `API/local.env` como `API/.env`

Cargar datos de prueba (opcional pero recomendado):

```bash
npm run seed
```

iniciar:

```bash
npm run dev
```

abrir `http://localhost:3000/status/estado`, debe responder `{ "estado": true }`.

## 3. frontend (APP)

En otro terminal:

```bash
cd APP
npm install
```

crear `APP/.env`:

```env
VITE_API_URL=http://localhost:3000
```

modo desarrollo:

```bash
npm run dev
```

abrir la url que muestra vite (normalmente `http://localhost:5173`).
