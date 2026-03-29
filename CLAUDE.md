# CLAUDE.md — EstacionaUC
> Instrucciones para Claude Code al trabajar en este proyecto.

---

## 🎯 Contexto del Proyecto

**EstacionaUC** es una plataforma web que permite a estudiantes de la Pontificia Universidad Católica de Chile (Campus San Joaquín) pagar y recargar el saldo de su TUC (Tarjeta Universidad Católica) de forma online, eliminando la necesidad de ir a los tótems físicos del campus.

**Problema que resuelve:** Los estudiantes que ingresan al estacionamiento sin saldo quedan debiendo $2.350 CLP, que actualmente solo pueden pagar de forma presencial en tótems, generando filas innecesarias.

---

## 📁 Estructura del Proyecto

```
estacionamiento-uc/
├── CLAUDE.md              ← Este archivo
├── docs.md                ← Documentación y bitácora del proyecto
├── skills/                ← Skills reutilizables creadas durante el proyecto
│   └── [skill-name].md
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   └── models/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Reglas Generales

### 1. 🔁 Regla de Skills (MUY IMPORTANTE)
> Si durante el desarrollo realizas una tarea **dos o más veces**, debes inmediatamente crear una skill en `/skills/[nombre-skill].md` que documente el patrón reutilizable.

**Ejemplos de cuándo crear una skill:**
- Crear un endpoint de API (segunda vez que lo hagas)
- Escribir validación de formulario
- Conectar con la base de datos
- Manejar errores HTTP
- Crear un componente de UI

**Formato de una skill:**
```markdown
# Skill: [Nombre]
**Cuándo usarla:** [descripción breve]

## Patrón
[código o pasos reutilizables]

## Ejemplo
[ejemplo concreto de uso]
```

### 2. 📝 Actualización Diaria de docs.md
Al **final de cada sesión de trabajo**, Claude Code debe:
1. Actualizar `docs.md` con todo lo realizado en el día (sección "Bitácora")
2. Hacer commit con el mensaje: `docs: actualización [fecha DD/MM/YYYY]`
3. Hacer push a GitHub: `git push origin main`

### 3. 🔒 Variables de Entorno
- **Nunca** hardcodear credenciales, API keys ni contraseñas
- Siempre usar `.env` y documentar las variables en `.env.example`
- El `.env` real nunca debe subirse a GitHub (ya está en `.gitignore`)

### 4. 🌿 Git y Commits
- Commits en español, claros y descriptivos
- Formato: `tipo: descripción breve`
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `style:` cambios de UI/CSS
  - `docs:` documentación
  - `refactor:` refactorización sin cambio funcional
  - `chore:` tareas de mantenimiento

### 5. 🗣️ Idioma
- Código: inglés (variables, funciones, comentarios técnicos)
- UI/UX: español (textos visibles al usuario)
- Documentación: español

---

## 🚀 Prompts del Proyecto (Fases)

Ejecutar en este orden. Cada prompt es una sesión de trabajo independiente.

---

### PROMPT 1 — Setup inicial y GitHub
```
Configura el proyecto EstacionaUC desde cero:

1. Crea la estructura de carpetas definida en CLAUDE.md
2. Inicializa un repositorio Git local
3. Crea el .gitignore para Node.js (ignorar node_modules, .env, dist)
4. Crea un README.md con la descripción del proyecto, el problema que resuelve
   y las instrucciones básicas de instalación (vacías por ahora)
5. Crea el .env.example con los placeholders de variables que necesitaremos:
   PORT, DB_URL, TRANSBANK_API_KEY, TRANSBANK_COMMERCE_CODE, UC_SSO_CLIENT_ID, UC_SSO_SECRET
6. Sube todo a GitHub:
   - Crea un repo público llamado "estacionamiento-uc" en tu cuenta
   - Haz el primer commit: "chore: setup inicial del proyecto"
   - Push a main
7. Actualiza docs.md con lo realizado hoy
```

---

### PROMPT 2 — Frontend base
```
Construye el frontend base de EstacionaUC:

1. Toma el archivo index.html ya diseñado y colócalo en /frontend/
2. Separa el CSS en /frontend/css/styles.css
3. Separa el JS en /frontend/js/app.js
4. Crea /frontend/js/api.js (vacío por ahora, preparado para conectar con el backend)
5. Asegúrate que todo funcione igual que antes (mismo diseño, misma interactividad)
6. Agrega un favicon simple (emoji 🅿️ como SVG)
7. Valida que el formulario no permite avanzar sin correo @uc.cl o @puc.cl y sin número de TUC
8. Commit: "feat: frontend base separado en módulos"
9. Push a GitHub
10. Actualiza docs.md
```

---

### PROMPT 3 — Backend con Node.js + Express
```
Crea el backend de EstacionaUC:

1. Inicializa Node.js en /backend/ con package.json
2. Instala dependencias: express, dotenv, cors, helmet, morgan, express-validator
3. Crea la estructura:
   - src/server.js (punto de entrada)
   - src/routes/payment.routes.js
   - src/routes/tuc.routes.js
   - src/controllers/payment.controller.js
   - src/controllers/tuc.controller.js
   - src/middleware/auth.middleware.js
   - src/middleware/errorHandler.js
4. Endpoints a crear:
   POST /api/payment/deuda     → pagar deuda pendiente
   POST /api/payment/recharge  → recargar saldo
   GET  /api/tuc/:tucNumber    → consultar saldo de TUC
   POST /api/auth/login        → autenticación con correo UC
5. Por ahora los controllers devuelven respuestas mock (sin DB real)
6. Commit: "feat: backend base con Express y endpoints mock"
7. Push y actualiza docs.md
```

---

### PROMPT 4 — Base de datos
```
Integra una base de datos a EstacionaUC:

1. Elige SQLite para desarrollo (fácil, sin servidor) usando la librería 'better-sqlite3'
2. Crea /backend/src/models/schema.sql con las tablas:
   - users (id, email, tuc_number, created_at)
   - transactions (id, user_id, type, amount, status, folio, created_at)
   - tuc_balances (id, tuc_number, balance, updated_at)
3. Crea /backend/src/db/database.js para la conexión
4. Crea /backend/src/models/ con los modelos User, Transaction, TucBalance
5. Conecta los controllers existentes a la base de datos real
6. Crea un script /backend/src/db/seed.js con datos de prueba
7. Commit: "feat: base de datos SQLite con modelos y seed"
8. Push y actualiza docs.md
```

---

### PROMPT 5 — Integración Webpay (Transbank)
```
Integra el procesamiento de pagos con Transbank Webpay:

1. Instala el SDK oficial: transbank-sdk
2. Crea /backend/src/services/transbank.service.js
3. Configura el ambiente de integración (sandbox) con las credenciales de prueba
4. Implementa el flujo completo de Webpay Plus:
   - Crear transacción → redirigir al usuario → recibir confirmación → actualizar saldo TUC
5. Crea las rutas necesarias:
   POST /api/payment/init      → inicia transacción Webpay
   GET  /api/payment/return    → recibe el return de Webpay
   POST /api/payment/confirm   → confirma y registra el pago
6. Actualiza el frontend para redirigir al flujo de Webpay en vez del mock
7. Documenta en docs.md cómo probar pagos en sandbox
8. Commit: "feat: integración Webpay Plus en ambiente sandbox"
9. Push y actualiza docs.md
```

---

### PROMPT 6 — Autenticación UC
```
Implementa autenticación institucional para EstacionaUC:

1. Crea un sistema de login con correo @uc.cl / @puc.cl
2. Instala: jsonwebtoken, bcryptjs
3. Crea /backend/src/services/auth.service.js
4. Implementa:
   - Registro de usuario con validación de correo UC
   - Login con JWT (token expira en 24h)
   - Middleware de autenticación para rutas protegidas
   - Ruta de verificación de token
5. Protege los endpoints de pago (requieren JWT válido)
6. En el frontend: crea una pantalla de login antes del formulario de pago
7. Guarda el JWT en sessionStorage (no localStorage)
8. Commit: "feat: sistema de autenticación con JWT"
9. Push y actualiza docs.md
```

---

### PROMPT 7 — Historial y dashboard del estudiante
```
Agrega un dashboard personal al estudiante autenticado:

1. Crea /frontend/dashboard.html
2. El dashboard debe mostrar:
   - Saldo actual de la TUC
   - Deuda pendiente (si existe)
   - Historial de los últimos 10 movimientos
   - Botón rápido "Pagar deuda" o "Recargar"
3. En el backend, agrega:
   GET /api/user/dashboard    → saldo + deuda + últimas transacciones
   GET /api/user/history      → historial completo paginado
4. Diseño coherente con el index.html (misma paleta, tipografía)
5. Commit: "feat: dashboard del estudiante con historial"
6. Push y actualiza docs.md
```

---

### PROMPT 8 — Notificaciones por correo
```
Implementa notificaciones por correo electrónico:

1. Instala: nodemailer
2. Configura con Gmail SMTP o Resend (según disponibilidad)
3. Crea /backend/src/services/email.service.js
4. Templates de correo a crear (HTML simple):
   - Confirmación de pago exitoso (con folio y detalle)
   - Alerta de saldo bajo (cuando quede menos de $2.350)
   - Bienvenida al registrarse
5. Dispara el correo de confirmación automáticamente después de cada pago
6. Agrega a .env.example: EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
7. Commit: "feat: notificaciones por correo con Nodemailer"
8. Push y actualiza docs.md
```

---

### PROMPT 9 — Deploy y producción
```
Prepara EstacionaUC para producción:

1. Configura variables de entorno para producción en .env.example
2. Agrega scripts en package.json: start, dev, build
3. Crea Dockerfile básico para el backend
4. Instrucciones en docs.md para deploy en:
   - Railway o Render (backend Node.js)
   - Vercel o Netlify (frontend estático)
5. Configura CORS correctamente para el dominio de producción
6. Agrega rate limiting: express-rate-limit (máx 100 req/15min por IP)
7. Audit de seguridad básico con npm audit
8. Commit: "chore: configuración para producción"
9. Push final y actualiza docs.md con estado final del proyecto
```

---

## 🛑 Lo que Claude Code NO debe hacer

- Subir el archivo `.env` real a GitHub
- Usar credenciales de producción de Transbank sin estar en un ambiente seguro
- Hardcodear el número de TUC o correos de prueba en el código de producción
- Saltarse la actualización de `docs.md` al final del día
- Crear funciones sin documentar qué hacen

---

## 📞 Contacto / Contexto adicional

- Universidad: Pontificia Universidad Católica de Chile
- Campus: San Joaquín, Santiago
- Sistema de tarjeta: TUC (Tarjeta Universidad Católica)
- Tarifa estacionamiento: $2.350 CLP por ingreso
- Pasarela de pago oficial Chile: Transbank / Webpay Plus
