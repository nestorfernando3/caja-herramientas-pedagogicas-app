# Caja de Herramientas Pedagogicas - Web App Colaborativa

Aplicacion web para convertir la caja de herramientas pedagogicas en un repositorio vivo, colaborativo y escalable.

## Enlaces
- Repositorio GitHub: `https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app`
- Web app en GitHub (código fuente): `https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app/tree/main`
- Deploy en Render (1 click): `https://render.com/deploy?repo=https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app`
- Rama activa de trabajo: `codex/caja-webapp-inicial`
- Despliegue en Render (one-click desde repo): `render.yaml`

## Estado del proyecto
- Web app funcional con frontend y backend integrados.
- Flujo colaborativo docente (`pending -> published/archived`).
- Migracion inicial de 5 categorias y 15 herramientas.
- Documentacion completa en `docs/`.

## Caracteristicas principales
- Repositorio con buscador, filtros y ordenamiento.
- Formulario para aportes docentes.
- Panel editorial con aprobacion y archivo de propuestas.
- Creacion de categorias desde interfaz (modo editor).
- Exportacion de backup en JSON.
- Estadisticas basicas de crecimiento del repositorio.

## Arquitectura
- Backend: `Node.js + Express`
- Frontend: `HTML + CSS + JavaScript`
- Persistencia: `data/db.json`

## Estructura
- `src/server.js`: API REST + seguridad editorial.
- `src/db.js`: acceso a persistencia local.
- `public/index.html`: layout de la web app.
- `public/styles.css`: estilos y responsive.
- `public/app.js`: logica de cliente.
- `data/db.json`: datos del repositorio.
- `docs/`: documentacion operativa y tecnica.

## Ejecucion local
1. Instalar dependencias:
```bash
npm install
```
2. Configurar variables:
```bash
cp .env.example .env
```
3. Iniciar en desarrollo:
```bash
npm run dev
```
4. Abrir:
- `http://localhost:3000`

## Variables de entorno
- `PORT=3000`
- `ADMIN_API_KEY=...`

## Scripts
- `npm run dev`: modo desarrollo con recarga.
- `npm start`: modo produccion.
- `npm run lint`: validacion de sintaxis.

## Produccion rápida
- Docker local:
```bash
docker compose up --build
```
- Render:
1. Conecta el repo en Render.
2. Selecciona Blueprint y usa `render.yaml`.
3. Deploy.

## Documentacion
- [Indice](./docs/INDICE.md)
- [Vision](./docs/VISION.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Guia Docentes](./docs/GUIA_DOCENTES.md)
- [Guia Editores](./docs/GUIA_EDITORES.md)
- [API](./docs/API.md)
- [Modelo de Datos](./docs/MODELO_DATOS.md)
- [Despliegue](./docs/DESPLIEGUE.md)
- [Mantenimiento](./docs/MANTENIMIENTO.md)

## Seguridad y contribucion
- [SECURITY.md](./SECURITY.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
