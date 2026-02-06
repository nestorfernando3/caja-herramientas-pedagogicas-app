# Modelo de Datos

Persistencia en `data/db.json`.

## Estructura raiz
- `categories[]`
- `tools[]`
- `meta`

## Categoria
- `id`
- `name`
- `description`
- `color`
- `position`
- `isPublished`
- `createdAt`
- `updatedAt`

## Herramienta
- `id`
- `categoryId`
- `title`
- `summary`
- `digitalOptions[]`
- `analogOptions[]`
- `tip`
- `peiConnection`
- `tags[]`
- `status`
- `authorName`
- `authorEmail`
- `createdAt`
- `updatedAt`
- `publishedAt`

## Meta
- `name`
- `organization`
- `version`
- `description` (opcional)
- `updatedAt` (opcional)
