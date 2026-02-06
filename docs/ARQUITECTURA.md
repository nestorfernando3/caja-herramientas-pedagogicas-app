# Arquitectura Tecnica

## Stack
- Backend: Node.js + Express.
- Frontend: HTML, CSS y JavaScript vanilla.
- Persistencia: archivo JSON (`data/db.json`).

## Capas
- `src/server.js`: API REST, reglas de negocio, seguridad por clave editorial.
- `src/db.js`: lectura/escritura de datos.
- `public/index.html`: estructura UI.
- `public/styles.css`: estilo y responsive.
- `public/app.js`: consumo API, render y flujos UX.

## Seguridad aplicada
- Endpoints editoriales protegidos con `x-api-key`.
- Validacion de campos obligatorios en backend.
- Separacion entre datos `published` y `pending` para usuarios no editores.

## Escalabilidad
- El modelo separa categorias y herramientas para crecimiento incremental.
- Se puede migrar a SQL sin cambiar contratos principales de API.
- El export JSON permite backup y continuidad operativa.
