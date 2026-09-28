# API REST de agencias de seguros de salud

API desarrollada con Express.js y JavaScript ES Modules, siguiendo la arquitectura del Repo B. Implementa los contenidos de las semanas 7 y 8 del Repo A: autenticación con JWT y cookies HttpOnly, rotación de refresh tokens, autorización RBAC y medidas de seguridad HTTP. El dominio gestiona agencias, pólizas, planes y reclamaciones de seguros de salud.

## Tecnologías

- Node.js, Express 5 y pnpm
- JWT (`jsonwebtoken`) y contraseñas con bcryptjs
- Helmet, CORS con lista permitida y `express-rate-limit`
- Datos de demostración en memoria (`src/data/db.js`)

## Estructura

```text
src/
├── controllers/       # Autenticación y operaciones del dominio
├── data/              # Datos de demostración en memoria
├── middlewares/       # JWT, RBAC, CORS, sanitización y límites de tasa
├── routes/            # Rutas de autenticación y negocio
└── index.js           # Configuración y servidor Express
```

## Inicio

```bash
pnpm install
cp .env.example .env
```

Configura dos secretos distintos, aleatorios y de al menos 32 caracteres en `.env` (`JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`). Ajusta `CORS_ORIGINS` como una lista de orígenes separados por comas y luego inicia el servidor:

```bash
pnpm dev
```

El servicio queda disponible en `http://localhost:3000`; `GET /health` devuelve el estado. Los datos y refresh tokens se guardan en memoria y se reinician al detener el proceso. Las cuentas iniciales son `admin@saludsegura.com`, `agente@saludsegura.com` y `analista@saludsegura.com`, todas con contraseña `admin123`; solo para desarrollo local.

## Roles

| Rol | Permisos |
| --- | --- |
| `ADMIN` | Consultar y gestionar pólizas y agencias; consultar planes y reclamaciones |
| `AGENT` | Consultar, crear y actualizar pólizas; consultar agencias, planes y reclamaciones |
| `ANALYST` | Consulta de pólizas con datos de contacto del titular omitidos; consulta de agencias, planes y reclamaciones |

La API no implementa todavía asignación de usuarios a agencias, por lo que las cuentas de agente comparten el conjunto de datos de demostración.

## Endpoints

Las cookies de autenticación son HttpOnly. En producción también llevan `Secure`; para clientes que no gestionen cookies se acepta `Authorization: Bearer <access-token>` si disponen de uno.

| Método | Ruta | Acceso | Uso |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Público, límite de autenticación | Registrar agente |
| `POST` | `/api/auth/login` | Público, límite de autenticación | Iniciar sesión y emitir cookies |
| `GET` | `/api/auth/me` | Usuario autenticado | Consultar perfil |
| `POST` | `/api/auth/refresh` | Refresh cookie, límite de autenticación | Rotar refresh y renovar access |
| `POST` | `/api/auth/logout` | Público | Revocar refresh y limpiar cookies |
| `GET` | `/api/agencies` | Autenticado | Listar agencias |
| `POST` | `/api/agencies` | `ADMIN` | Crear agencia |
| `GET` | `/api/policies` | Autenticado | Listar pólizas |
| `GET` | `/api/policies/:id` | Autenticado | Consultar póliza |
| `POST` | `/api/policies` | `ADMIN`, `AGENT` | Crear póliza |
| `PATCH` | `/api/policies/:id` | `ADMIN`, `AGENT` | Actualizar póliza |
| `DELETE` | `/api/policies/:id` | `ADMIN` | Eliminar póliza |
| `GET` | `/api/plans` | Autenticado | Listar planes de cobertura |
| `GET` | `/api/claims` | Autenticado | Listar reclamaciones |

El alta de póliza requiere `policyNumber`, `holderName`, `holderEmail`, `plan`, `premium` (número positivo) y `startDate`. El estado inicial es `PENDING`. El número de póliza debe ser único.

## Controles de seguridad

- Contraseñas con bcrypt y 10 rondas; las respuestas de login no revelan si falló el correo o la contraseña.
- Access JWT de 15 minutos y refresh JWT de 7 días con secretos separados.
- Refresh tokens guardados como hash bcrypt y rotados al renovar; logout revoca el token actual.
- Cookies `HttpOnly`, `SameSite=Strict`, `Secure` en producción; no se envían tokens en el cuerpo JSON.
- RBAC devuelve `401` sin autenticación y `403` ante un rol sin permiso.
- Helmet, límite JSON de 10 KB, whitelist CORS, límite general de 100 solicitudes por 15 minutos y de autenticación de 10 por 15 minutos.
- Rechazo de claves de entrada que contengan `$` o `.` para reducir riesgo de inyección NoSQL.
- Errores internos no exponen stack traces ni detalles de implementación.
