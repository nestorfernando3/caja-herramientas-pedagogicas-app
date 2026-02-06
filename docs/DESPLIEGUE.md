# Despliegue y Operacion

## Requisitos
- Node.js 20+
- NPM 10+

## Frontend (GitHub Pages)
El despliegue es automatico con `Deploy GitHub Pages` al hacer push a `main`.

## Backend (opcional)
Puedes usar cualquier backend publico compatible con esta API (gratuito o propio).
Si no conectas backend, la app funciona en modo local sin login.

## Variables backend
- `PORT`
- `ADMIN_API_KEY`
- `CORS_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_POSTS`

## URL de API en frontend
- Archivo: `site/config.js`
- Campo: `window.CAJA_CONFIG.apiBaseUrl`
- Alternativa sin editar archivos: abrir la web con `?api=https://tu-backend` (se guarda en navegador)
- Si la API no responde, el frontend pasa automaticamente a modo local.

## Local (paso a paso)
### Ruta simple: probar la misma versión que GitHub Pages
```bash
npm install
npm run build:pages
npx serve dist
```
Luego abre la URL local que imprime `serve`.

### Ruta técnica: correr servidor Node completo
```bash
npm install
cp .env.example .env
npm run dev
```
Luego abre:
- `http://localhost:3000`

## Produccion backend
```bash
npm install --omit=dev
npm start
```
