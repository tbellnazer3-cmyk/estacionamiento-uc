# docs.md — EstacionaUC
> Documentación técnica y bitácora del proyecto.

---

## 📋 Descripción General

**EstacionaUC** es una plataforma web para el pago online del estacionamiento del Campus San Joaquín de la Pontificia Universidad Católica de Chile.

| Campo | Detalle |
|-------|---------|
| **Proyecto** | EstacionaUC |
| **Universidad** | Pontificia Universidad Católica de Chile |
| **Campus** | San Joaquín, Santiago |
| **Problema** | Pago de estacionamiento solo presencial en tótems |
| **Solución** | Portal web para pagar/recargar TUC online |
| **Tarifa** | $2.350 CLP por ingreso |
| **Pasarela de pago** | Transbank / Webpay Plus |
| **Repositorio** | https://github.com/tbellnazer3-cmyk/estacionamiento-uc |

---

## 🗺️ Arquitectura del Sistema

```
[Estudiante]
     │
     ▼
[Frontend HTML/CSS/JS]  ←──── /frontend/
     │  (fetch API)
     ▼
[Backend Node.js + Express]  ←──── /backend/
     │
     ├──── [SQLite DB]          ← transactions, users, balances
     ├──── [Transbank SDK]      ← procesamiento de pagos
     ├──── [Nodemailer]         ← notificaciones por correo
     └──── [JWT Auth]           ← autenticación institucional UC
```

---

## ⚙️ Variables de Entorno

Copiar `.env.example` a `.env` y completar los valores.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `DB_URL` | Ruta base de datos SQLite | `./database.sqlite` |
| `JWT_SECRET` | Clave secreta para tokens JWT | `[clave-aleatoria-segura]` |
| `TRANSBANK_API_KEY` | API Key de Transbank | `[key-sandbox-o-producción]` |
| `TRANSBANK_COMMERCE_CODE` | Código de comercio Transbank | `597055555532` |
| `UC_SSO_CLIENT_ID` | Client ID SSO institucional UC | `[pendiente]` |
| `UC_SSO_SECRET` | Secret SSO institucional UC | `[pendiente]` |
| `EMAIL_USER` | Correo para enviar notificaciones | `estacionauc@gmail.com` |
| `EMAIL_PASSWORD` | Contraseña o App Password | `[app-password]` |
| `EMAIL_FROM` | Nombre visible del remitente | `EstacionaUC` |

---

## 🗃️ Modelo de Datos

### Tabla: `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER PK | ID autoincremental |
| `email` | TEXT UNIQUE | Correo @uc.cl o @puc.cl |
| `password_hash` | TEXT | Contraseña hasheada con bcrypt |
| `tuc_number` | TEXT | Número de TUC del estudiante |
| `created_at` | DATETIME | Fecha de registro |

### Tabla: `tuc_balances`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER PK | ID autoincremental |
| `tuc_number` | TEXT UNIQUE | Número de TUC |
| `balance` | INTEGER | Saldo en pesos chilenos (CLP) |
| `updated_at` | DATETIME | Última actualización |

### Tabla: `transactions`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER PK | ID autoincremental |
| `user_id` | INTEGER FK | Referencia a users.id |
| `tuc_number` | TEXT | TUC afectada |
| `type` | TEXT | `deuda` o `recarga` |
| `amount` | INTEGER | Monto en CLP |
| `status` | TEXT | `pending`, `approved`, `failed` |
| `folio` | TEXT | Folio único del pago |
| `webpay_token` | TEXT | Token de sesión Webpay |
| `created_at` | DATETIME | Fecha y hora de la transacción |

---

## 🔌 API Endpoints

### Auth
| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/register` | Registrar estudiante UC | No |
| `POST` | `/api/auth/login` | Login, devuelve JWT | No |
| `GET` | `/api/auth/verify` | Verifica token JWT | Sí |

### TUC
| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| `GET` | `/api/tuc/:tucNumber` | Consultar saldo de TUC | Sí |

### Pagos
| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| `POST` | `/api/payment/init` | Inicia transacción Webpay | Sí |
| `GET` | `/api/payment/return` | Return URL de Webpay | No |
| `POST` | `/api/payment/confirm` | Confirma y registra pago | No |

### Usuario
| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| `GET` | `/api/user/dashboard` | Saldo + deuda + últimas transacciones | Sí |
| `GET` | `/api/user/history` | Historial completo paginado | Sí |

---

## 🚀 Guía de Deploy

### Backend — Railway (recomendado)

1. Crear cuenta en [railway.app](https://railway.app) e instalar la CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. Desde la carpeta `/backend`:
   ```bash
   railway init        # crear proyecto
   railway up          # primer deploy
   ```

3. Configurar variables de entorno en el dashboard de Railway:
   ```
   NODE_ENV=production
   PORT=3000
   DB_URL=/data/database.sqlite
   JWT_SECRET=<clave-aleatoria-64-bytes>
   FRONTEND_URL=https://tu-app.vercel.app
   BACKEND_URL=https://tu-app.up.railway.app
   TRANSBANK_ENV=production
   TRANSBANK_API_KEY=<key-real>
   TRANSBANK_COMMERCE_CODE=<code-real>
   EMAIL_USER=<correo>
   EMAIL_PASSWORD=<app-password>
   EMAIL_FROM=EstacionaUC
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

4. Agregar un volumen persistente montado en `/data` para la base de datos SQLite.

5. El `Dockerfile` en `/backend` es detectado automáticamente por Railway.

> **Alternativa:** Render.com — conectar el repo de GitHub, indicar que la raíz del servicio es `/backend` y agregar las mismas variables de entorno.

---

### Frontend — Vercel (recomendado)

1. Crear cuenta en [vercel.com](https://vercel.com) e instalar la CLI:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. Desde la carpeta `/frontend`:
   ```bash
   vercel          # seguir el asistente interactivo
   ```
   - Framework: **Other**
   - Build command: (vacío, es HTML estático)
   - Output directory: `.` (raíz)

3. Actualizar la URL del backend en `.env` de Railway:
   ```
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```

4. Actualizar la constante `API_BASE` en `frontend/js/api.js` con la URL real del backend:
   ```js
   const API_BASE = 'https://tu-app.up.railway.app/api';
   ```

> **Alternativa:** Netlify — arrastrar la carpeta `/frontend` al dashboard o conectar el repo.

---

### Checklist pre-deploy

- [ ] Generar `JWT_SECRET` nuevo: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Cambiar `TRANSBANK_ENV=production` y cargar credenciales reales de Transbank
- [ ] Verificar que `.env` real NO está en el repositorio (`git status`)
- [ ] Ejecutar `npm audit` y resolver vulnerabilidades críticas
- [ ] Probar el health check: `GET /api/health`
- [ ] Confirmar que `FRONTEND_URL` en el backend coincide con el dominio real de Vercel

---

## 🔒 Rate Limiting

Configurado en `server.js` con `express-rate-limit`:

| Parámetro | Valor por defecto | Variable `.env` |
|-----------|-------------------|-----------------|
| Ventana de tiempo | 15 minutos | `RATE_LIMIT_WINDOW_MS` |
| Máximo de requests | 100 por IP | `RATE_LIMIT_MAX` |

Respuesta cuando se supera el límite:
```json
{ "success": false, "error": "Demasiadas peticiones. Intenta de nuevo en 15 minutos." }
```

---

## 🐳 Docker

Construir y correr el backend localmente con Docker:

```bash
cd backend

# Construir imagen
docker build -t estacionauc-backend .

# Correr con volumen para la DB y archivo .env
docker run -p 3000:3000 \
  --env-file ../.env \
  -v estacionauc-data:/data \
  estacionauc-backend
```

---

## 🧪 Cómo probar pagos en Sandbox (Webpay Plus)

### Requisitos previos
```bash
cd backend
npm install       # incluye transbank-sdk
npm run seed      # carga usuarios y saldos de prueba
npm run dev       # servidor en http://localhost:3000
```
Abre `frontend/index.html` con Live Server (VS Code) en `http://localhost:5500`.

### Flujo de prueba paso a paso

1. **Ingresar datos** en el formulario del frontend:
   - Correo: `estudiante1@uc.cl`
   - TUC: `2024-0007654-3` (esta TUC tiene saldo 0 → tiene deuda)
   - Pestaña "Pagar deuda" → clic en **Pagar**

2. **Ser redirigido a Webpay** (ambiente de integración de Transbank)

3. **Completar el pago** con los datos de prueba:

| Campo | Valor |
|-------|-------|
| Tarjeta de crédito | `4051 8856 0044 6623` |
| CVV | `123` |
| Vencimiento | `11/25` |
| RUT titular | `11.111.111-1` |
| Clave bancaria | `123` |

4. **Resultado**: Webpay redirige a `http://localhost:5500/webpay-return.html`
   - Si fue aprobado → pantalla verde con folio y código de autorización
   - Si fue rechazado → pantalla roja
   - Si se canceló → pantalla gris

### Variables de entorno para producción (cuando se obtengan)
```
TRANSBANK_API_KEY=<api-key-real>
TRANSBANK_COMMERCE_CODE=<commerce-code-real>
```
Y en `transbank.service.js` cambiar `Environment.Integration` por `Environment.Production`.

---

## 🧪 Credenciales de Prueba (Sandbox Transbank)

Usar en ambiente de integración para probar pagos sin dinero real:

| Campo | Valor |
|-------|-------|
| **Commerce Code** | `597055555532` |
| **API Key** | `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C` |
| **Tarjeta de prueba** | `4051 8856 0044 6623` |
| **CVV** | `123` |
| **Vencimiento** | `11/25` |
| **RUT** | `11.111.111-1` |
| **Clave** | `123` |

> ⚠️ Estas son credenciales públicas de Transbank solo para testing. Nunca usar en producción.

---

## 🐙 GitHub — Guía de Configuración Inicial

### 1. Crear cuenta en GitHub
1. Ir a https://github.com/signup
2. Registrarse con tu correo personal (no el UC)
3. Verificar el correo
4. Elegir el plan gratuito

### 2. Crear el repositorio
1. En GitHub, clic en `+` → `New repository`
2. Nombre: `estacionamiento-uc`
3. Descripción: `Portal de pago online de estacionamiento - Campus San Joaquín PUC`
4. Visibilidad: `Public`
5. **No** inicializar con README (ya lo tenemos)
6. Clic en `Create repository`

### 3. Configurar Git local (una sola vez)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 4. Conectar el proyecto local a GitHub
```bash
git init
git add .
git commit -m "chore: setup inicial del proyecto"
git branch -M main
git remote add origin https://github.com/[TU-USUARIO]/estacionamiento-uc.git
git push -u origin main
```

### 5. Flujo diario
```bash
# Al final de cada sesión de trabajo:
git add .
git commit -m "docs: actualización [DD/MM/YYYY]"
git push origin main
```

---

## 📦 Dependencias del Proyecto

### Backend
| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | ^4.18 | Framework web |
| `dotenv` | ^16 | Variables de entorno |
| `cors` | ^2.8 | CORS headers |
| `helmet` | ^7 | Seguridad HTTP headers |
| `morgan` | ^1.10 | Logging de requests |
| `express-validator` | ^7 | Validación de inputs |
| `better-sqlite3` | ^9 | Base de datos SQLite |
| `jsonwebtoken` | ^9 | Autenticación JWT |
| `bcryptjs` | ^2.4 | Hash de contraseñas |
| `transbank-sdk` | ^4 | Integración Webpay |
| `nodemailer` | ^6 | Envío de correos |
| `express-rate-limit` | ^7 | Rate limiting |

### Frontend
| Recurso | Uso |
|---------|-----|
| Google Fonts (DM Serif Display + DM Sans) | Tipografía |
| Vanilla JS | Sin frameworks externos |

---

## 📅 Bitácora del Proyecto

### Día 0 — Setup inicial
**Fecha:** 29/03/2026
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] Diseño inicial del sitio (estacionamiento-uc.html monolítico existente)
- [x] CLAUDE.md creado con reglas del proyecto
- [x] docs.md creado con documentación base
- [x] Repositorio GitHub creado: https://github.com/tbellnazer3-cmyk/estacionamiento-uc
- [x] Estructura de carpetas inicializada (frontend/, backend/, skills/)
- [x] .gitignore para Node.js creado
- [x] .env.example con placeholders de variables de entorno
- [x] README.md con descripción del proyecto e instrucciones de instalación
- [x] Primer commit: "chore: setup inicial del proyecto"
- [x] Push a GitHub (rama main)

---

### Día 8 — Deploy y producción
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 9
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `.env.example` ampliado con variables de producción: `NODE_ENV`, `TRANSBANK_ENV`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- [x] `express-rate-limit ^7.4.0` agregado a `backend/package.json`
- [x] `src/server.js` actualizado:
  - Rate limiting: 100 req / 15 min por IP (configurable vía `.env`)
  - CORS con lista blanca dinámica (`FRONTEND_URL` puede ser CSV de múltiples orígenes)
  - Morgan en modo `combined` en producción, `dev` en desarrollo
- [x] `backend/Dockerfile` creado (Node 20 Alpine, compilación de `better-sqlite3`, volumen `/data`)
- [x] `backend/.dockerignore` creado
- [x] Commit: "chore: configuración para producción"
- [x] Push a GitHub

**Problemas encontrados:**
- `npm audit` no pudo ejecutarse (Node.js aún no instalado localmente). Ejecutar manualmente tras `npm install`.

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Ver guía de deploy más abajo para Railway + Vercel

---

### Día 7 — Notificaciones por correo
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 8
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `nodemailer ^6.9.13` agregado a `backend/package.json`
- [x] `src/services/email.service.js` creado con:
  - Transporter Gmail SMTP (modo silencioso si EMAIL_USER/EMAIL_PASSWORD no están configurados)
  - Template HTML `templatePagoConfirmado` — folio, tipo, monto, TUC, código de autorización, fecha, estado
  - Template HTML `templateSaldoBajo` — TUC, saldo actual vs mínimo requerido ($2.350)
  - Template HTML `templateBienvenida` — correo, TUC, descripción de funcionalidades
  - Funciones públicas: `sendPaymentConfirmation`, `sendLowBalanceAlert`, `sendWelcomeEmail`
- [x] `src/controllers/payment.controller.js` — tras pago aprobado en `returnPayment`:
  - Envía confirmación de pago al email del estudiante
  - Si el nuevo saldo < $2.350, envía alerta de saldo bajo automáticamente
- [x] `src/controllers/auth.controller.js` — tras registro exitoso envía correo de bienvenida
- [x] `.env.example` ya incluía `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` (de sesión anterior)
- [x] Commit: "feat: notificaciones por correo con Nodemailer"
- [x] Push a GitHub

**Cómo configurar Gmail SMTP:**
1. Activar verificación en 2 pasos en tu cuenta Google
2. Ir a `Cuenta Google → Seguridad → Contraseñas de aplicaciones`
3. Crear una App Password para "Correo / Otro"
4. Agregar al `.env`:
   ```
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # App Password (16 chars)
   EMAIL_FROM=EstacionaUC
   ```

**Correos que se envían automáticamente:**
| Evento | Template | Destinatario |
|--------|----------|--------------|
| Pago aprobado | Confirmación con folio y detalle | Email del estudiante |
| Saldo post-pago < $2.350 | Alerta de saldo bajo | Email del estudiante |
| Registro de cuenta | Bienvenida | Email del nuevo usuario |

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Ejecutar Prompt 9 (Deploy y producción)

---

### Día 6 — Dashboard del estudiante
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 7
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `src/controllers/user.controller.js` — `getDashboard` (saldo + deuda + 10 recientes) y `getHistory` (paginado)
- [x] `src/routes/user.routes.js` — `GET /api/user/dashboard` y `GET /api/user/history`
- [x] `src/server.js` — registrada la ruta `/api/user`
- [x] `frontend/dashboard.html` — dashboard completo con:
  - Card saldo TUC (gradiente azul destacado)
  - Card estado de deuda (rojo si hay deuda, verde si está al día)
  - Card total de transacciones
  - Banner de deuda con botón "Pagar ahora" (visible solo si hay deuda)
  - Botones de acción rápida (pagar / recargar / inicio)
  - Tabla historial con badge de tipo, monto coloreado, folio, estado y fecha
  - Paginación dinámica
  - Auth guard: redirige a login si no hay sesión
- [x] `frontend/js/app.js` — nav actualizado con link "Mi cuenta" → dashboard.html
- [x] Commit: "feat: dashboard del estudiante con historial"
- [x] Push a GitHub

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Ejecutar Prompt 8 (Notificaciones por correo)

---

### Día 5 — Autenticación con JWT
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 6
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `jsonwebtoken` y `bcryptjs` agregados a `package.json`
- [x] `src/services/auth.service.js` — hashPassword (bcrypt), comparePassword, generateToken (24h), verifyToken
- [x] `src/middleware/auth.middleware.js` — `requireAuth` reescrito con `verifyToken` real; detecta `TokenExpiredError`
- [x] `src/controllers/auth.controller.js` — `register`, `login`, `verify` conectados a DB + bcrypt + JWT
- [x] `src/routes/auth.routes.js` — rutas `POST /register`, `POST /login`, `GET /verify`
- [x] `src/db/seed.js` — actualizado para usar `hashPassword` de auth.service (hashes bcrypt reales)
- [x] `frontend/login.html` — página de login/registro con tabs, validación inline, toggle contraseña
- [x] `frontend/js/app.js` — `procesarPago` redirige a login si no hay sesión; `updateNav` muestra email/logout; `prefillForm` pre-carga email y TUC del usuario logueado
- [x] `frontend/index.html` — `<span id="nav-auth-item">` en nav para estado de sesión
- [x] JWT se guarda en `sessionStorage` (no `localStorage`)
- [x] Commit: "feat: sistema de autenticación con JWT"
- [x] Push a GitHub

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Ejecutar Prompt 7 (Dashboard del estudiante)

---

### Día 4 — Integración Webpay Plus (sandbox)
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 5
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `transbank-sdk` agregado a `package.json`
- [x] `src/services/transbank.service.js` — encapsula `crearTransaccion`, `confirmarTransaccion`, `estaAutorizado`
- [x] Ambiente de integración configurado con `IntegrationCommerceCodes.WEBPAY_PLUS` y `IntegrationApiKeys.WEBPAY`
- [x] Flujo completo implementado: init → Webpay → return → confirmar → actualizar saldo
- [x] `POST /api/payment/init` — crea transacción en DB (pending) e inicia en Webpay, devuelve `webpay_url`
- [x] `GET|POST /api/payment/return` — recibe token_ws, llama commit, actualiza DB y TUC, redirige al frontend
- [x] `POST /api/payment/confirm` — permite consultar estado por folio
- [x] `Transaction.findByWebpayToken` y `Transaction.updateWebpayToken` agregados al modelo
- [x] `express.urlencoded` habilitado en server.js (necesario para form POST de Webpay)
- [x] `frontend/js/app.js` actualizado: `procesarPago` llama `/api/payment/init` y redirige a Webpay URL
- [x] `frontend/webpay-return.html` — página de resultado (éxito / rechazado / cancelado / error)
- [x] `BACKEND_URL` agregado a `.env` y `.env.example`
- [x] Commit: "feat: integración Webpay Plus en ambiente sandbox"
- [x] Push a GitHub

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Ejecutar Prompt 6 (Autenticación JWT)

---

### Día 3 — Base de datos SQLite
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 4
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `better-sqlite3` agregado a `package.json` (+ script `npm run seed`)
- [x] `src/models/schema.sql` — tablas `users`, `tuc_balances`, `transactions` con índices y constraints
- [x] `src/db/database.js` — conexión singleton, aplica schema al iniciar, cierra al apagar
- [x] `src/models/User.js` — findByEmail, findById, findByTuc, create, emailExists, tucExists
- [x] `src/models/TucBalance.js` — findByTuc, upsert, addBalance
- [x] `src/models/Transaction.js` — create, findById, findByFolio, updateStatus, findByUser, findByUserPaginated
- [x] Controllers `payment`, `tuc` y `auth` conectados a la DB real (reemplaza datos mock)
- [x] `src/db/seed.js` — 3 usuarios, 3 saldos TUC, 4 transacciones de prueba
- [x] Commit: "feat: base de datos SQLite con modelos y seed"
- [x] Push a GitHub

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Instalar Node.js si aún no está instalado
- Ejecutar `npm install && npm run seed` en `/backend/`
- Ejecutar Prompt 5 (Integración Webpay)

---

### Día 2 — Backend Node.js + Express
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 3
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `backend/package.json` inicializado con dependencias: express, dotenv, cors, helmet, morgan, express-validator
- [x] `src/server.js` — punto de entrada con middleware global (helmet, cors, morgan, json)
- [x] `src/routes/payment.routes.js` — rutas POST /deuda y POST /recharge con validaciones
- [x] `src/routes/tuc.routes.js` — ruta GET /:tucNumber
- [x] `src/routes/auth.routes.js` — ruta POST /login
- [x] `src/controllers/payment.controller.js` — mock: devuelve folio y detalle del pago
- [x] `src/controllers/tuc.controller.js` — mock: consulta saldo desde objeto en memoria
- [x] `src/controllers/auth.controller.js` — mock: devuelve token temporal
- [x] `src/middleware/auth.middleware.js` — valida Bearer token (mock) y adjunta req.user
- [x] `src/middleware/errorHandler.js` — manejador centralizado de errores
- [x] `.env` creado localmente con variables de desarrollo (no subido a GitHub)
- [x] Commit: "feat: backend base con Express y endpoints mock"
- [x] Push a GitHub

**Problemas encontrados:**
- Node.js no estaba instalado en el sistema. Los archivos fueron creados correctamente; el usuario debe instalar Node.js y ejecutar `npm install` antes de correr el servidor.

**Skills creadas:**
- Ninguna nueva

**Próximo paso:**
- Instalar Node.js (ver instrucciones abajo)
- Ejecutar Prompt 4 (Base de datos SQLite)

---

### Día 1 — Frontend base modularizado
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 2
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `estacionamiento-uc.html` movido y adaptado como `frontend/index.html`
- [x] CSS extraído a `frontend/css/styles.css` (estilos + clases de error de validación)
- [x] JS extraído a `frontend/js/app.js` (lógica de tabs, pagos, validación)
- [x] `frontend/js/api.js` creado con estructura lista para conectar al backend (Prompt 3)
- [x] Favicon SVG creado en `frontend/assets/favicon.svg` (icono P azul/dorado)
- [x] Validación mejorada: regex estricta para @uc.cl / @puc.cl, formato TUC, mensajes inline
- [x] Commit: "feat: frontend base separado en módulos"
- [x] Push a GitHub

**Problemas encontrados:**
- Ninguno

**Skills creadas:**
- Ninguna nueva (primera iteración de cada patrón)

**Próximo paso:**
- Ejecutar Prompt 3 (Backend Node.js + Express)

---

> 💡 Claude Code debe agregar una nueva entrada aquí al final de cada sesión de trabajo.

---

## ✅ Checklist de Fases

| # | Prompt | Estado | Fecha |
|---|--------|--------|-------|
| 1 | Setup inicial y GitHub | ✅ Completado | 29/03/2026 |
| 2 | Frontend base modularizado | ✅ Completado | 29/03/2026 |
| 3 | Backend Node.js + Express | ✅ Completado | 29/03/2026 |
| 4 | Base de datos SQLite | ✅ Completado | 29/03/2026 |
| 5 | Integración Webpay | ✅ Completado | 29/03/2026 |
| 6 | Autenticación JWT | ✅ Completado | 29/03/2026 |
| 7 | Dashboard del estudiante | ✅ Completado | 29/03/2026 |
| 8 | Notificaciones por correo | ✅ Completado | 29/03/2026 |
| 9 | Deploy y producción | ✅ Completado | 29/03/2026 |

---

*Última actualización: 29/03/2026 — Proyecto completo (Prompts 1–9) ✅*
