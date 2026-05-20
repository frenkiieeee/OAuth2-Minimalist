# OAuth2 Minimalist

Sistema de autenticación OAuth2 minimalista y adaptable para cualquier proyecto.

## Caracteristicas

- **OAuth2 con Google** - Login via Google OAuth 2.0
- **Login tradicional** - Email y contrasena
- **JWT + Refresh Tokens** - Seguridad maxima con tokens cortos
- **PostgreSQL** - Base de datos relacional con Prisma ORM
- **TypeScript** - Tipado completo en backend y frontend
- **React + shadcn/ui** - Frontend minimalista y personalizable
- **Docker** - Containerizacion completa

## Estructura del Proyecto

```
OAuth2-Minimalist/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/        # Login, Account
│   │   ├── hooks/        # useAuth
│   │   ├── services/     # API calls
│   │   └── types/        # Tipos TypeScript
│   └── package.json
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/       # Endpoints API
│   │   ├── controllers/  # Logica de controladores
│   │   ├── services/     # Logica de negocio
│   │   ├── middleware/   # Auth, rate limit
│   │   ├── adapters/     # Patron adapter BD
│   │   └── types/        # Tipos TypeScript
│   └── prisma/           # Schema de BD
├── docker-compose.yml
└── README.md
```

## Inicio Rapido

### 1. Clonar y configurar

```bash
# Clonar repositorio
git clone https://github.com/frenkiieeee/OAuth2-Minimalist.git
cd OAuth2-Minimalist

# Instalar dependencias
pnpm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cd server
cp .env.example .env
```

Editar `.env` con tus valores:

```env
PORT=3000
NODE_ENV=development
DB_ADAPTER=memory
JWT_SECRET=tu-secret-super-secreto-cambiar-en-produccion
JWT_ACCESS_EXPIRY=15m

# OAuth2 Google (opcional para login con Google)
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Frontend
CLIENT_URL=http://localhost:5173
```

### 3. Ejecutar en modo desarrollo

```bash
# Desde la raiz del proyecto
pnpm dev
```

Esto iniciara:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### 4. Configurar Google OAuth (opcional)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto o seleccionar existente
3. APIs y servicios > Credenciales > Crear credenciales > ID de cliente OAuth
4. Configurar URI de redireccion autorizado:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copiar Client ID y Client Secret a `.env`

## Endpoints API

### Autenticacion

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/auth/register` | Registro con email/contrasena |
| POST | `/auth/login` | Login con email/contrasena |
| POST | `/auth/logout` | Cerrar sesion |
| POST | `/auth/refresh` | Refrescar access token |
| GET | `/auth/me` | Obtener usuario actual |
| GET | `/auth/google` | Iniciar login con Google |
| GET | `/auth/google/callback` | Callback de Google OAuth |

### Ejemplos

**Registro:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contrasena123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"contrasena123"}'
```

**Obtener usuario (con token):**
```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## Arquitectura de Seguridad

### Flujo de Autenticacion

```
Usuario -> /auth/login (email/pass)
        -> Servidor valida credenciales
        -> Genera access token (JWT, 15min)
        -> Genera refresh token (uuid, 7 dias)
        -> Almacena refresh token en BD
        -> Envia access token + httpOnly cookie (refresh)

Usuario -> /auth/me (con access token)
        -> Middleware verifica JWT
        -> Devuelve datos de usuario

Usuario -> Token expira
        -> /auth/refresh (con cookie refresh)
        -> Servidor valida refresh token
        -> Genera nuevos tokens (rotation)
        -> Invalida refresh token anterior
```

### Medidas de Seguridad

| Medida | Implementacion |
|--------|----------------|
| CSRF | State token en OAuth flow |
| XSS | httpOnly cookies, sanitizacion |
| Rate Limiting | 10 requests/15min en auth |
| Helmet | Security headers |
| CORS | Whitelist configurable |
| JWT | RS256 simetrico, 15min expiry |
| Refresh Token | One-time use, rotation |
| Password | bcrypt (12 rounds) |

## Base de Datos

### Schema Prisma

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  avatar        String?
  authMethod    AuthMethod  # GOOGLE | EMAIL
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

### Adapter Pattern

El proyecto soporta multiples adaptadores de base de datos:

- **MemoryAdapter** - Para desarrollo sin BD (usado por defecto)
- **PostgresAdapter** - Para produccion con PostgreSQL

Para cambiar de adapter, modificar `DB_ADAPTER` en `.env`:
```env
DB_ADAPTER=postgres  # memory | postgres
```

## Docker

### Desarrollo con Docker Compose

```bash
# Crear archivo .env en raiz con tus valores
cp server/.env.example .env

# Editar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET

# Ejecutar
docker-compose up
```

### Solo backend con PostgreSQL externo

```yaml
# Tu docker-compose.yml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DB_ADAPTER=postgres
      - DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Integracion en Proyectos Existentes

### Backend

1. Copiar directorio `server/`
2. Configurar `.env`
3. Ejecutar `pnpm install`
4. Para desarrollo: `pnpm dev:server`
5. Para produccion: `pnpm build && pnpm start`

### Frontend

El frontend es una aplicacion React standalone. Para integrar:

1. Copiar directorio `client/`
2. Ejecutar `pnpm install && pnpm dev`
3. Personalizar componentes en `src/components/`

Para usar los componentes de autenticacion:

```tsx
import { useAuth } from '@/hooks/useAuth';

function TuComponente() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <p>Hola {user?.name}</p>;
}
```

## Comandos

```bash
# Desarrollo
pnpm dev              # Ejecutar todo
pnpm dev:server       # Solo backend
pnpm dev:client       # Solo frontend

# Build
pnpm build            # Compilar todo

# Base de datos
pnpm --filter server db:push      # Crear tablas
pnpm --filter server db:generate   # Generar cliente Prisma
pnpm --filter server db:studio     # Abrir Prisma Studio

# Calidad
pnpm lint             # Linting
pnpm typecheck        # Verificacion de tipos
```