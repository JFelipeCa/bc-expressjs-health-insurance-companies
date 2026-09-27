# 🚀 API REST - Agencia de Marketing Digital

Sistema backend desarrollado con Express.js, Node.js y **pnpm**. Implementa autenticación JWT, autorización RBAC y medidas de seguridad OWASP conforme a los requerimientos de la **Semana 7 y 8**.

---

## 🛠️ Tecnologías y Herramientas

- **Entorno de ejecución:** Node.js (ES Modules - `type: "module"`)
- **Framework:** Express.js v5
- **Gestor de paquetes:** `pnpm`
- **Autenticación:** `jsonwebtoken` (JWT) + `bcryptjs`
- **Seguridad HTTP:** `helmet`, `cors`, `express-rate-limit`
- **Variables de Entorno:** `dotenv`

---

## 📁 Arquitectura del Proyecto

agencia-marketing-api/
├── src/
│   ├── controllers/
│   │   ├── agency.controller.js     # Lógica de negocio (Clients, Campaigns, Channels, Metrics)
│   │   └── auth.controller.js       # Autenticación y generación de JWT
│   ├── data/
│   │   └── db.js                    # Base de datos simulada en memoria
│   ├── middlewares/
│   │   ├── auth.middleware.js       # [Semana 7 & 8] JWT y Control de Roles (RBAC)
│   │   └── security.middleware.js   # [Semana 8] Rate Limiter
│   ├── routes/
│   │   ├── agency.routes.js         # Rutas protegidas del dominio
│   │   └── auth.routes.js           # Rutas públicas de autenticación
│   └── index.js                     # Servidor Express y seguridad global
├── .env                             # Variables de entorno
├── package.json
└── README.md

---

## 🔐 Implementación Semanal

### 🛡️ Semana 7: Autenticación con JWT
- **Cifrado de contraseñas:** Uso de `bcryptjs` para comparar contraseñas de forma segura.
- **Generación de JWT:** Creación de Tokens firmados con tiempo de expiración (2 horas) en `/api/auth/login`.
- **Protección de rutas:** Middleware `verifyToken` que valida la cabecera `Authorization: Bearer <TOKEN>`.

### 🛡️ Semana 8: Autorización y Seguridad OWASP
- **Control de Acceso Basado en Roles (RBAC):** Middleware `requireRoles` para restringir accesos (`ADMIN` vs `ANALYST`).
- **Headers HTTP Seguros:** Integración de `helmet` para proteger cabeceras HTTP.
- **Protección CORS:** Habilitado para comunicación entre dominios.
- **Límite de Tasa (Rate Limiting):** Prevención de ataques DDoS y fuerza bruta mediante `express-rate-limit`.

---

## 🔑 Usuarios de Prueba

| Email | Contraseña | Rol | Permisos |
| :--- | :--- | :--- | :--- |
| `admin@agencia.com` | `admin123` | **ADMIN** | Acceso total a lectura y creación de recursos |
| `analista@agencia.com` | `admin123` | **ANALYST** | Lectura general y creación limitada a campañas |

---

## 🚀 Instrucciones de Ejecución

1. Clonar o ingresar a la carpeta del proyecto:
   cd agencia-marketing-api

2. Instalar dependencias usando pnpm:
   pnpm install

3. Verificar el archivo .env en la raíz con las variables:
   PORT=3000
   JWT_SECRET=MarketingAgencySuperSecretKey2024!

4. Iniciar el servidor en modo desarrollo:
   pnpm dev

---

## 📡 Endpoints de la API

### Autenticación (Pública)
- **POST** `/api/auth/login` -> Iniciar sesión y obtener token JWT.

### Entidades Protegidas (Requieren Header: `Authorization: Bearer <TOKEN>`)

- **Clients (Clientes):**
  - **GET** `/api/clients` -> Listar clientes (Cualquier usuario autenticado)
  - **POST** `/api/clients` -> Crear cliente (Solo ROL: ADMIN)

- **Campaigns (Campañas):**
  - **GET** `/api/campaigns` -> Listar campañas (Cualquier usuario autenticado)
  - **POST** `/api/campaigns` -> Crear campaña (ROLES: ADMIN o ANALYST)

- **Channels (Canales):**
  - **GET** `/api/channels` -> Listar canales de marketing (Cualquier usuario autenticado)

- **Metrics (Métricas):**
  - **GET** `/api/metrics` -> Listar métricas de campañas (Cualquier usuario autenticado)