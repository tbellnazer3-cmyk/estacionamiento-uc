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
| 3 | Backend Node.js + Express | ⏳ Pendiente | — |
| 4 | Base de datos SQLite | ⏳ Pendiente | — |
| 5 | Integración Webpay | ⏳ Pendiente | — |
| 6 | Autenticación JWT | ⏳ Pendiente | — |
| 7 | Dashboard del estudiante | ⏳ Pendiente | — |
| 8 | Notificaciones por correo | ⏳ Pendiente | — |
| 9 | Deploy y producción | ⏳ Pendiente | — |

---

*Última actualización: 29/03/2026 — Prompt 2 completado*
