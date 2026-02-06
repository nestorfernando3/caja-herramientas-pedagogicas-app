# Caja de Herramientas Pedagógicas

Repositorio colaborativo de estrategias para docentes de Brisas del Río.

## Sitio web
- Web en línea: `https://nestorfernando3.github.io/caja-herramientas-pedagogicas-app/`
- Repositorio: `https://github.com/nestorfernando3/caja-herramientas-pedagogicas-app`

## Qué puedes hacer en la web
- Explorar herramientas por categoría.
- Buscar por título, resumen o etiquetas.
- Enviar nuevas recomendaciones desde el formulario.
- Guardar aportes localmente en el navegador.
- Enviar recomendaciones por correo a `nestor.BDR@gmail.com`.

## Flujo de trabajo recomendado
1. Un docente propone una herramienta desde la web.
2. La recomendación se envía por correo a `nestor.BDR@gmail.com`.
3. Se revisa el aporte.
4. Si aplica, se publica en el repositorio.

## Estructura del proyecto
- `site/`: versión pública para GitHub Pages.
- `data/db.json`: base de herramientas y categorías.
- `public/`: interfaz web completa.
- `src/`: servidor y API local para desarrollo.
- `docs/`: guías operativas y técnicas.

## Ejecutar en local
```bash
npm install
npm run dev
```

## Publicación
- La web se publica automáticamente en GitHub Pages cuando hay cambios en `main`.
- Workflow: `.github/workflows/pages.yml`.

## Documentación
- [Índice](./docs/INDICE.md)
- [Guía para docentes](./docs/GUIA_DOCENTES.md)
- [Guía para editores](./docs/GUIA_EDITORES.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Despliegue](./docs/DESPLIEGUE.md)

## Contribución y seguridad
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
