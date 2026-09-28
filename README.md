# API de agencias de seguros de salud

API REST construida con Express.js para administrar agencias y sus operaciones de seguros de salud. Incluye registro e inicio de sesión, autenticación JWT con cookies HttpOnly, gestión de pólizas y controles de acceso por rol.

## Tecnologías

- Node.js y Express 5 con módulos ES
- pnpm para instalar dependencias
- JWT y bcryptjs para autenticación y hash de contraseñas
- Helmet, CORS y express-rate-limit para medidas de seguridad
- Datos de demostración guardados en memoria

## Estructura del proyecto

```text
src/
├── controllers/       # Lógica HTTP de autenticación y seguros
├── data/              # Usuarios, agencias, pólizas y datos iniciales
├── middlewares/       # JWT, roles, CORS, sanitización y rate limit
├── routes/            # Rutas de autenticación y recursos
└── index.js           # Configuración y arranque de Express
```

## Requisitos

- Node.js
- pnpm 12.6.0

## Configuración e inicio

1. Instala las dependencias desde la raíz del repositorio:

   ```bash
   pnpm install
   ```

2. Crea un archivo llamado `.env` en la raíz del proyecto. **El archivo no se incluye en el repositorio** porque contiene configuración local y secretos. Puedes crearlo con este contenido:

   ```env
   PORT=3000
   NODE_ENV=development
   JWT_ACCESS_SECRET=PEGA_AQUI_UN_SECRETO_ALEATORIO
   JWT_REFRESH_SECRET=PEGA_AQUI_OTRO_SECRETO_ALEATORIO
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. Genera dos secretos diferentes, cada uno de al menos 32 caracteres. Puedes ejecutar este comando dos veces y usar cada resultado en una variable distinta:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
   ```

   No publiques ni compartas los valores de `.env`. El archivo está excluido por `.gitignore`. La aplicación no inicia si falta alguno de los secretos, si son iguales o si tienen menos de 32 caracteres.

4. Inicia el servidor:

   ```bash
   pnpm dev
   ```

   La API queda disponible en `http://localhost:3000`. Usa `pnpm start` para iniciar sin recarga automática.

## Probar con Thunder Client

1. Envía `GET http://localhost:3000/health`. Una respuesta `200` con `{"status":"ok"}` indica que el servidor está activo.
2. Inicia sesión con `POST http://localhost:3000/api/auth/login`, cuerpo JSON:

   ```json
   {
     "email": "admin@saludsegura.com",
     "password": "admin123"
   }
   ```

3. Thunder Client debe conservar las cookies HttpOnly que devuelve el login. Después envía `GET http://localhost:3000/api/policies` para consultar las pólizas.
4. Para registrar otro usuario, envía `POST http://localhost:3000/api/auth/register` con `name`, `email` y una contraseña de al menos ocho caracteres. Los usuarios nuevos reciben el rol `AGENT`.

Las cuentas precargadas son `admin@saludsegura.com`, `agente@saludsegura.com` y `analista@saludsegura.com`; todas usan `admin123`. Son credenciales de demostración local, no aptas para producción.

## Roles y permisos

| Rol | Permisos |
| --- | --- |
| `ADMIN` | Consultar y administrar pólizas y agencias; consultar planes y reclamaciones |
| `AGENT` | Consultar, crear y actualizar pólizas; consultar agencias, planes y reclamaciones |
| `ANALYST` | Consultar pólizas sin datos de contacto del titular; consultar agencias, planes y reclamaciones |

Las cuentas comparten los datos de demostración; todavía no existe una relación entre cada usuario y una agencia específica.

## Endpoints

Las rutas protegidas aceptan la cookie de acceso emitida por el login. También aceptan `Authorization: Bearer <token>` cuando el cliente envía el access token manualmente.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Información básica de la API |
| `GET` | `/health` | Público | Estado del servidor |
| `POST` | `/api/auth/register` | Público | Crear una cuenta de agente |
| `POST` | `/api/auth/login` | Público | Iniciar sesión y emitir cookies |
| `GET` | `/api/auth/me` | Autenticado | Consultar el perfil de la sesión |
| `POST` | `/api/auth/refresh` | Refresh cookie | Renovar y rotar los tokens |
| `POST` | `/api/auth/logout` | Público | Revocar el refresh token y limpiar cookies |
| `GET` | `/api/agencies` | Autenticado | Listar agencias |
| `POST` | `/api/agencies` | `ADMIN` | Crear una agencia |
| `GET` | `/api/policies` | Autenticado | Listar pólizas |
| `GET` | `/api/policies/:id` | Autenticado | Consultar una póliza |
| `POST` | `/api/policies` | `ADMIN`, `AGENT` | Crear una póliza |
| `PATCH` | `/api/policies/:id` | `ADMIN`, `AGENT` | Actualizar una póliza |
| `DELETE` | `/api/policies/:id` | `ADMIN` | Eliminar una póliza |
| `GET` | `/api/plans` | Autenticado | Listar planes de cobertura |
| `GET` | `/api/claims` | Autenticado | Listar reclamaciones |

Para crear una póliza, envía `policyNumber`, `holderName`, `holderEmail`, `plan`, `premium` y `startDate`. `premium` debe ser un número positivo y `policyNumber` no puede repetirse. Las pólizas nuevas quedan en estado `PENDING`.

## Autenticación y seguridad

- Las contraseñas se guardan con hash bcrypt; no se devuelven en las respuestas.
- El access token dura 15 minutos y el refresh token, 7 días. Cada uno usa un secreto distinto.
- Los tokens se envían en cookies HttpOnly; el refresh token se guarda como hash en memoria y se rota al renovar.
- Las cookies usan `SameSite=Strict` y llevan `Secure` cuando `NODE_ENV=production`.
- Los endpoints de autenticación tienen un límite de 10 solicitudes por IP cada 15 minutos. El resto de `/api` tiene un límite de 100.
- Helmet configura cabeceras de seguridad, CORS usa los orígenes listados en `CORS_ORIGINS` y el cuerpo JSON se limita a 10 KB.
- Las entradas con claves que contengan `$` o `.` se rechazan para reducir el riesgo de inyección NoSQL.
- Los errores internos no exponen trazas ni detalles de implementación.

## Persistencia

Los usuarios, agencias, pólizas, planes, reclamaciones y refresh tokens se almacenan en memoria para esta implementación educativa. Los cambios se pierden al detener el servidor; no se deben usar estos datos de demostración como almacenamiento de producción.
