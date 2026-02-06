# Despliegue y Operacion

## Requisitos
- Node.js 20+
- NPM 10+

## Frontend (GitHub Pages)
El despliegue es automatico con `Deploy GitHub Pages` al hacer push a `main`.

## Backend (Render)
1. Abrir deploy 1 click:
- `https://render.com/deploy?repo=https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app`
2. Confirmar blueprint `render.yaml`.
3. Esperar URL publica del servicio API.

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

## Local
```bash
npm install
cp .env.example .env
npm run dev
```

## Produccion backend
```bash
npm install --omit=dev
npm start
```
