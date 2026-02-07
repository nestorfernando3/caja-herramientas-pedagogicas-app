# Caja de Herramientas Pedagógicas

Plataforma colaborativa de estrategias de aula para docentes de Brisas del Río.

## Acceso rápido
- Sitio web: [https://nestorfernando3.github.io/caja-herramientas-pedagogicas-app/](https://nestorfernando3.github.io/caja-herramientas-pedagogicas-app/)
- Repositorio: [https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app](https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app)

## Qué resuelve
- Centraliza herramientas pedagógicas por categoría.
- Facilita búsqueda por título, resumen y etiquetas.
- Permite recibir propuestas docentes desde la web.
- Mantiene un flujo de revisión antes de publicar.

## Flujo de aportes
1. Docente envía una recomendación desde la web.
2. El aporte queda guardado localmente en el navegador.
3. El docente envía la recomendación por correo a `nestor.BDR@gmail.com`.
4. El equipo editorial revisa y publica si aplica.

## Inicio local en 1 minuto
### Requisitos
- Node.js 20+
- npm 10+

### Opción recomendada (igual a GitHub Pages)
```bash
npm install
npm run build:pages
npx serve dist
```
Abre la URL que imprime la terminal (normalmente `http://localhost:3000`).

### Opción técnica (servidor Node local)
```bash
npm install
cp .env.example .env
npm run dev
```
Abre: `http://localhost:3000`.

## Comandos útiles
```bash
npm run dev         # servidor local con recarga
npm run build:pages # genera sitio estático en dist/
npm run lint        # validación de sintaxis
npm start           # arranque en modo producción
```

## Estructura del proyecto
- `site/`: versión pública usada en GitHub Pages.
- `data/db.json`: base de categorías y herramientas.
- `public/`: interfaz web completa.
- `src/`: servidor y API local para desarrollo.
- `docs/`: guías funcionales y técnicas.

## Publicación
- Deploy automático en GitHub Pages al hacer push a `main`.
- Workflow: `/Users/nestor/Documents/New project/.github/workflows/pages.yml`

## Documentación clave
- [Índice](./docs/INDICE.md)
- [Guía para docentes](./docs/GUIA_DOCENTES.md)
- [Guía para editores](./docs/GUIA_EDITORES.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Despliegue](./docs/DESPLIEGUE.md)
- [Mantenimiento](./docs/MANTENIMIENTO.md)

## Seguridad y contribución
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
- [CHANGELOG.md](./CHANGELOG.md)
