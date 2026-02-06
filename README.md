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
### Requisitos
- Node.js 20 o superior
- npm 10 o superior

### Opción A: ver la web pública localmente (recomendada)
1. Instala dependencias:
```bash
npm install
```
2. Genera la versión estática:
```bash
npm run build:pages
```
3. Levanta un servidor local para `dist/`:
```bash
npx serve dist
```
4. Abre en tu navegador la URL que muestra la terminal (normalmente `http://localhost:3000`).

### Opción B: correr servidor Node local (modo desarrollo técnico)
1. Instala dependencias:
```bash
npm install
```
2. (Opcional) crea variables de entorno:
```bash
cp .env.example .env
```
3. Inicia el servidor:
```bash
npm run dev
```
4. Abre:
- `http://localhost:3000`

### Verificación rápida
- Si todo está bien, debes ver el repositorio cargado y el buscador funcionando.
- Si no carga, ejecuta:
```bash
npm run lint
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
