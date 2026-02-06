# Referencia API

Base local: `http://localhost:3000`
Base publica objetivo: `https://caja-herramientas-pedagogicas-api.onrender.com`

## Autenticacion editorial
Enviar header:
- `x-api-key: <ADMIN_API_KEY>`

## Endpoints

### Salud
- `GET /api/health`

### Metadatos
- `GET /api/meta`
- `PATCH /api/meta` (admin)

### Categorias
- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)

### Herramientas y aportes
- `GET /api/tools`
  - Query opcional: `categoryId`, `q`, `status`, `includeHidden=true` (admin)
- `POST /api/tools`
  - Publico: crea `pending`
  - Admin: crea `published`
- `POST /api/contributions`
  - Alias publico de aportes, crea `pending`
- `PUT /api/tools/:id` (admin)
- `PATCH /api/tools/:id/status` (admin)

### Analitica y exportacion
- `GET /api/stats`
- `GET /api/export` (admin)

## Estados de herramienta
- `pending`
- `published`
- `archived`

## CORS y limites
- CORS configurable por `CORS_ORIGINS`.
- Limite de envio publico por IP con `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX_POSTS`.
