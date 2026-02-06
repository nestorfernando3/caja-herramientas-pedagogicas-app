# Arquitectura Tecnica

## Stack
- Frontend publico: HTML/CSS/JS en GitHub Pages (`site/`).
- Backend publico: Node.js + Express (`src/`).
- Persistencia: JSON versionable (`data/db.json`).

## Modos de operacion del frontend
- `Modo API`: consulta y envia aportes al backend publico.
- `Modo Local`: fallback automatico cuando la API no esta disponible.

## Capas
- `site/`: app publica sin login.
- `scripts/build-pages.sh`: construccion de `dist/` para Pages.
- `src/server.js`: API REST, seguridad editorial, CORS y rate limit.
- `src/db.js`: acceso a datos.

## Seguridad aplicada
- Endpoints editoriales protegidos con `x-api-key`.
- CORS restringible por lista blanca.
- Limite de envios publicos por IP.
- Separacion entre `published` y `pending`.

## Escalabilidad
- Separacion frontend/backend para evolucion independiente.
- API preparada para migrar persistencia a SQL.
- Export JSON para respaldo operativo.
