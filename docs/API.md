# Referencia API

Base local: `http://localhost:3000`

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

### Herramientas
- `GET /api/tools`
  - Query opcional: `categoryId`, `q`, `status`, `includeHidden=true` (admin)
- `POST /api/tools`
  - Usuario normal: crea `pending`
  - Admin: crea `published`
- `PUT /api/tools/:id` (admin)
- `PATCH /api/tools/:id/status` (admin)

### Analitica y exportacion
- `GET /api/stats`
- `GET /api/export` (admin)

## Estados de herramienta
- `pending`
- `published`
- `archived`
