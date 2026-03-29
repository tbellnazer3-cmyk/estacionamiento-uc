# EstacionaUC

Portal web para el pago online del estacionamiento del Campus San Joaquín de la Pontificia Universidad Católica de Chile.

## Problema que resuelve

Los estudiantes que ingresan al estacionamiento sin saldo en su TUC (Tarjeta Universidad Católica) quedan debiendo $2.350 CLP. Actualmente, ese pago solo puede realizarse de forma presencial en los tótems del campus, generando filas innecesarias.

**EstacionaUC** permite pagar la deuda o recargar el saldo de la TUC de forma online, en cualquier momento y sin necesidad de ir al campus.

## Funcionalidades

- Pago de deuda pendiente de estacionamiento
- Recarga de saldo TUC
- Autenticación con correo institucional (@uc.cl / @puc.cl)
- Integración con Webpay Plus (Transbank)
- Historial de transacciones
- Notificaciones por correo electrónico

## Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **Pagos:** Transbank SDK — Webpay Plus
- **Autenticación:** JWT

## Instalación

### Requisitos previos

- Node.js >= 18
- npm >= 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/[TU-USUARIO]/estacionamiento-uc.git
cd estacionamiento-uc

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno
cp ../.env.example .env
# Editar .env con tus valores reales

# 4. Iniciar el servidor
npm run dev
```

### Frontend

Abrir `frontend/index.html` en un navegador, o servir estáticamente con cualquier servidor HTTP.

## Variables de Entorno

Ver [.env.example](.env.example) para la lista completa de variables requeridas.

## Licencia

Proyecto académico — Pontificia Universidad Católica de Chile.
