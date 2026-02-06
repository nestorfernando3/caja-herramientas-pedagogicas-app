# Caja de Herramientas Pedagogicas - Web App Colaborativa

Aplicacion web para convertir la caja de herramientas pedagogicas en un repositorio vivo, colaborativo y escalable.

## Enlaces
- Repositorio GitHub: `https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app`
- Web app en linea (GitHub Pages): `https://nestorfernando3.github.io/caja-herramientas-pedagogicas-app/`
- API publica (opcional): configura tu URL en `?api=https://tu-backend`

## Como funciona hoy
- El frontend esta en GitHub Pages y no requiere login.
- Si conectas una API publica, los aportes se envian al backend en estado `pending`.
- Puedes fijar la URL del backend abriendo la web con `?api=https://tu-backend` una sola vez.
- Si la API no responde, el frontend cambia automaticamente a modo local y guarda aportes en el navegador.

## Caracteristicas principales
- Repositorio con buscador, filtros y ordenamiento.
- Flujo de aportes docentes sin login.
- Modo API (publico) + fallback local automatico.
- Panel editorial en backend para aprobar (`published`) o archivar (`archived`).
- CORS configurable y limite basico de envios por IP.
- Uso gratuito base con GitHub Pages, sin servicios pagos obligatorios.

## Arquitectura
- Frontend GitHub Pages: `site/`.
- Build Pages: `scripts/build-pages.sh`.
- Backend API: `src/server.js` (Node.js + Express).
- Persistencia: `data/db.json`.

## Ejecucion local
1. Instalar dependencias:
```bash
npm install
```
2. Configurar variables:
```bash
cp .env.example .env
```
3. Iniciar backend:
```bash
npm run dev
```
4. Abrir:
- Backend local: `http://localhost:3000`
- Frontend Pages local (build): `npm run build:pages`

## Variables de entorno
- `PORT`: puerto HTTP.
- `ADMIN_API_KEY`: clave editorial.
- `CORS_ORIGINS`: lista de origenes permitidos (coma).
- `RATE_LIMIT_WINDOW_MS`: ventana de control para envios publicos.
- `RATE_LIMIT_MAX_POSTS`: maximo de envios por IP por ventana.

## Scripts
- `npm run dev`: modo desarrollo backend.
- `npm start`: modo produccion backend.
- `npm run lint`: validacion de sintaxis.
- `npm run build:pages`: construye sitio estatico para GitHub Pages.

## Despliegue
- Frontend: GitHub Pages (workflow `Deploy GitHub Pages`).
- Backend: opcional, trae tu propia URL API (cualquier proveedor gratuito que prefieras).

## Documentacion
- [Indice](./docs/INDICE.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [API](./docs/API.md)
- [Despliegue](./docs/DESPLIEGUE.md)
- [Guia Docentes](./docs/GUIA_DOCENTES.md)
- [Guia Editores](./docs/GUIA_EDITORES.md)

## Seguridad y contribucion
- [SECURITY.md](./SECURITY.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
