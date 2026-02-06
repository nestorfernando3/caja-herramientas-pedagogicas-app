# Caja de Herramientas Pedagogicas - Web App Colaborativa

Aplicacion web para convertir la caja de herramientas en un repositorio vivo, editable y creciente con aportes de multiples docentes.

## Lo que resuelve
- Publica las herramientas por categorias, con buscador y filtros.
- Permite que cualquier docente envie nuevas propuestas.
- Incluye flujo editorial (`pending -> published/archived`) para control de calidad.
- Mantiene datos en `data/db.json` para versionarlos facilmente con Git.

## Arquitectura
- Backend: `Node.js + Express`
- Frontend: `HTML + CSS + JavaScript` (SPA ligera)
- Persistencia: archivo JSON (`data/db.json`)

## Estructura
- `src/server.js`: API REST + servidor web.
- `src/db.js`: lectura/escritura de base JSON.
- `public/index.html`: interfaz.
- `public/styles.css`: estilos responsive.
- `public/app.js`: logica cliente.
- `data/db.json`: categorias y herramientas.

## Ejecucion local
1. Instalar dependencias:
```bash
npm install
```
2. Configurar variables:
```bash
cp .env.example .env
```
3. Iniciar:
```bash
npm run dev
```
4. Abrir en navegador:
- `http://localhost:3000`

## Variables de entorno
- `PORT`: puerto del servidor.
- `ADMIN_API_KEY`: clave para activar modo editor y aprobar publicaciones.

## API principal
- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `GET /api/tools`
- `POST /api/tools` (publico: crea `pending`; admin: crea `published`)
- `PUT /api/tools/:id` (admin)
- `PATCH /api/tools/:id/status` (admin)
- `GET /api/stats`
- `GET /api/export` (admin)

## Flujo colaborativo recomendado
1. Docente envia herramienta desde la web.
2. El sistema la guarda como `pending`.
3. Coordinador/editor revisa en "Panel editorial".
4. Publica (`published`) o archiva (`archived`).

## Despliegue rapido
Puedes desplegar en Render, Railway o un VPS con Docker/Node:
- Comando build: no requerido.
- Comando start: `npm start`
- Persistencia: montar volumen para conservar `data/db.json`.

## Evoluciones sugeridas
- Autenticacion por usuarios/roles.
- Historial de versiones por herramienta.
- Comentarios/revisiones entre docentes.
- Importador/exportador CSV.
- Integracion con base SQL (PostgreSQL) para crecimiento institucional.
