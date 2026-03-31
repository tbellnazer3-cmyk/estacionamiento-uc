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

> Las entradas están en orden cronológico descendente (más reciente primero).

---

### Sesión final — Resumen del día 29/03/2026
**Fecha:** 29/03/2026
**Estado:** ✅ Proyecto completo — todos los prompts ejecutados

**Todo lo realizado hoy (sesión completa):**

| Prompt | Descripción | Commit |
|--------|-------------|--------|
| Prompt 1 | Setup inicial, estructura de carpetas, GitHub | `chore: setup inicial del proyecto` |
| Prompt 2 | Frontend modularizado (HTML/CSS/JS separados, favicon, validación) | `feat: frontend base separado en módulos` |
| Prompt 3 | Backend Express con endpoints mock | `feat: backend base con Express y endpoints mock` |
| Prompt 4 | Base de datos SQLite con modelos y seed | `feat: base de datos SQLite con modelos y seed` |
| Prompt 5 | Integración Webpay Plus (sandbox Transbank) | `feat: integración Webpay Plus en ambiente sandbox` |
| Prompt 6 | Autenticación JWT + login.html | `feat: sistema de autenticación con JWT` |
| Prompt 7 | Dashboard del estudiante con historial paginado | `feat: dashboard del estudiante con historial` |
| Prompt 8 | Notificaciones por correo con Nodemailer | `feat: notificaciones por correo con Nodemailer` |
| Prompt 9 | Configuración de producción, rate limiting, Dockerfile | `chore: configuración para producción` |

**Estado del repositorio:** https://github.com/tbellnazer3-cmyk/estacionamiento-uc

**Para correr el proyecto localmente:**
```bash
# 1. Instalar Node.js LTS desde https://nodejs.org

# 2. Backend
cd backend
npm install
npm run seed   # carga datos de prueba
npm run dev    # http://localhost:3000

# 3. Frontend
# Abrir frontend/index.html con Live Server en VS Code (http://localhost:5500)
```

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
  - CORS con lista blanca dinámica (`FRONTEND_URL` soporta múltiples orígenes separados por coma)
  - Morgan en modo `combined` en producción, `dev` en desarrollo
- [x] `backend/Dockerfile` creado (Node 20 Alpine, compilación de `better-sqlite3`, volumen `/data`)
- [x] `backend/.dockerignore` creado
- [x] Instrucciones de deploy en `docs.md`: Railway (backend) + Vercel (frontend) + Docker local
- [x] Checklist pre-deploy documentado
- [x] Commit: `"chore: configuración para producción"`
- [x] Push a GitHub

**Problemas encontrados:**
- `npm audit` no pudo ejecutarse (Node.js no instalado localmente). Ejecutar manualmente con `npm install && npm audit` en `/backend/`.

---

### Día 7 — Notificaciones por correo
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 8
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `nodemailer ^6.9.13` agregado a `backend/package.json`
- [x] `src/services/email.service.js` creado con:
  - Transporter Gmail SMTP (modo silencioso si `EMAIL_USER`/`EMAIL_PASSWORD` no están en `.env`)
  - Template HTML `templatePagoConfirmado` — folio, tipo, monto, TUC, código de autorización, fecha
  - Template HTML `templateSaldoBajo` — TUC, saldo actual vs mínimo requerido ($2.350)
  - Template HTML `templateBienvenida` — correo, TUC registrada, descripción de funcionalidades
  - Funciones públicas: `sendPaymentConfirmation`, `sendLowBalanceAlert`, `sendWelcomeEmail`
- [x] `src/controllers/payment.controller.js` — tras pago aprobado en `returnPayment`:
  - Envía confirmación de pago al email del estudiante
  - Si el nuevo saldo < $2.350, envía alerta de saldo bajo automáticamente
- [x] `src/controllers/auth.controller.js` — tras registro exitoso, envía correo de bienvenida
- [x] `.env.example` incluye `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`
- [x] Commit: `"feat: notificaciones por correo con Nodemailer"`
- [x] Push a GitHub

**Correos disparados automáticamente:**
| Evento | Template | Cuándo |
|--------|----------|--------|
| Pago aprobado | Confirmación con folio y detalle | Después de `returnPayment` exitoso |
| Saldo post-pago < $2.350 | Alerta de saldo insuficiente | Mismo momento que la confirmación |
| Nuevo registro | Bienvenida | Después de `register` exitoso |

**Cómo configurar Gmail SMTP:**
```
# Cuenta Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # App Password de 16 caracteres
EMAIL_FROM=EstacionaUC
```

---

### Día 6 — Dashboard del estudiante
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 7
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `src/controllers/user.controller.js` — `getDashboard` (saldo + deuda + 10 recientes) y `getHistory` (paginado, máx 50/página)
- [x] `src/routes/user.routes.js` — `GET /api/user/dashboard` y `GET /api/user/history`
- [x] `src/server.js` — registrada la ruta `/api/user`
- [x] `frontend/dashboard.html` — dashboard completo con:
  - Card saldo TUC, card estado de deuda, card total de transacciones
  - Banner de deuda con botón "Pagar ahora" (visible solo si hay deuda)
  - Tabla historial con badge de tipo, monto coloreado, folio, estado y fecha
  - Paginación dinámica
  - Auth guard: redirige a `login.html` si no hay sesión activa
- [x] `frontend/js/app.js` — nav actualizado con link "Mi cuenta" → `dashboard.html`
- [x] Commit: `"feat: dashboard del estudiante con historial"`
- [x] Push a GitHub

---

### Día 5 — Autenticación con JWT
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 6
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `src/services/auth.service.js` — `hashPassword` (bcrypt 10 rounds), `comparePassword`, `generateToken` (24h), `verifyToken`
- [x] `src/middleware/auth.middleware.js` — `requireAuth` con detección de `TokenExpiredError` (401 diferenciado)
- [x] `src/controllers/auth.controller.js` — `register`, `login`, `verify` conectados a DB + bcrypt + JWT
- [x] `src/db/seed.js` — actualizado con hashes bcrypt reales (contraseña: `password123`)
- [x] `frontend/login.html` — página login/registro con tabs, validación inline, toggle contraseña
- [x] `frontend/js/app.js` — `procesarPago` redirige a login si no hay sesión; JWT en `sessionStorage`
- [x] Commit: `"feat: sistema de autenticación con JWT"`
- [x] Push a GitHub

---

### Día 4 — Integración Webpay Plus (sandbox)
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 5
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `src/services/transbank.service.js` — `crearTransaccion`, `confirmarTransaccion`, `estaAutorizado`
- [x] Ambiente Integration con `IntegrationCommerceCodes.WEBPAY_PLUS` y `IntegrationApiKeys.WEBPAY`
- [x] Flujo completo: `POST /api/payment/init` → Webpay → `POST /api/payment/return` → redirect al frontend
- [x] Manejo de cancelaciones (`TBK_TOKEN`) y timeouts
- [x] `express.urlencoded` habilitado para el form POST de Webpay
- [x] `frontend/webpay-return.html` — página de resultado (éxito / rechazado / cancelado / error)
- [x] Commit: `"feat: integración Webpay Plus en ambiente sandbox"`
- [x] Push a GitHub

---

### Día 3 — Base de datos SQLite
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 4
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `src/models/schema.sql` — tablas `users`, `tuc_balances`, `transactions` con índices y PRAGMA WAL
- [x] `src/db/database.js` — conexión singleton con cierre graceful al apagar
- [x] Modelos: `User.js`, `TucBalance.js`, `Transaction.js`
- [x] Controllers conectados a DB real (reemplaza mocks)
- [x] `src/db/seed.js` — 3 usuarios, 3 saldos TUC, 4 transacciones de prueba
- [x] Commit: `"feat: base de datos SQLite con modelos y seed"`
- [x] Push a GitHub

---

### Día 2 — Backend Node.js + Express
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 3
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `backend/package.json` con dependencias: express, dotenv, cors, helmet, morgan, express-validator
- [x] `src/server.js` con middleware global (helmet, cors, morgan, json, urlencoded)
- [x] Rutas y controllers mock para `/api/payment`, `/api/tuc`, `/api/auth`
- [x] `src/middleware/errorHandler.js` — manejador centralizado de errores
- [x] Commit: `"feat: backend base con Express y endpoints mock"`
- [x] Push a GitHub

**Notas:**
- Node.js no estaba instalado localmente. Instalar desde nodejs.org antes de `npm install`.

---

### Día 1 — Frontend base modularizado
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 2
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] HTML/CSS/JS separados en `frontend/index.html`, `css/styles.css`, `js/app.js`, `js/api.js`
- [x] Favicon SVG en `frontend/assets/favicon.svg`
- [x] Validación: regex estricta `@uc.cl` / `@puc.cl`, formato TUC `XXXX-XXXXXXX-X`, mensajes inline
- [x] Commit: `"feat: frontend base separado en módulos"`
- [x] Push a GitHub

---

### Día 0 — Setup inicial
**Fecha:** 29/03/2026
**Prompt ejecutado:** Prompt 1
**Estado:** ✅ Completado

**Tareas completadas:**
- [x] `CLAUDE.md` creado con reglas y prompts del proyecto
- [x] `docs.md` creado con documentación base
- [x] Repositorio GitHub: https://github.com/tbellnazer3-cmyk/estacionamiento-uc
- [x] Estructura de carpetas: `frontend/`, `backend/`, `skills/`
- [x] `.gitignore` para Node.js, `.env.example` con todos los placeholders
- [x] `README.md` con descripción e instrucciones de instalación
- [x] Commit: `"chore: setup inicial del proyecto"`
- [x] Push a GitHub (rama `main`)

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

*Última actualización: 29/03/2026 — Proyecto completo. Todos los Prompts 1–9 ejecutados. ✅*
